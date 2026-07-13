const express = require('express');
const router = express.Router();
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const TelegramConfig = require('../models/TelegramConfig');
const { Logger } = require('telegram/extensions');

// Enable verbose logging for GramJS to debug auth issues
Logger.setLevel('debug');

// Global cache for the active client (so we can use it to fetch intel later)
let activeClient = null;

const getOrCreateConfig = async () => {
  let config = await TelegramConfig.findOne({ configId: 'global' });
  if (!config) {
    config = new TelegramConfig({ configId: 'global' });
  }
  return config;
};

const ensureConnectedClient = async () => {
  if (activeClient && activeClient.connected) {
    return activeClient;
  }
  
  const config = await getOrCreateConfig();
  if (!config.sessionString) {
    return null;
  }
  
  try {
    const client = new TelegramClient(
      new StringSession(config.sessionString),
      Number(config.apiId),
      config.apiHash,
      { connectionRetries: 1 }
    );
    await client.connect();
    activeClient = client;
    config.status = 'Connected';
    await config.save();
    
    // Start live polling and background gap sync
    const scraper = require('../telegram/scraper');
    scraper.startLivePolling();
    
    const TelegramChannel = require('../models/TelegramChannel');
    TelegramChannel.find().then(channels => {
      console.log(`[TG Scraper] Booting up gap sync for ${channels.length} channels...`);
      channels.forEach(ch => scraper.startHistoricalScrape(ch._id));
    }).catch(e => console.error('[TG Scraper] Gap sync init failed:', e));

    return activeClient;
  } catch (err) {
    console.error('Failed to reconnect saved session:', err.message);
    config.status = 'Disconnected';
    await config.save();
    return null;
  }
};

// GET /api/telegram/status - Get current connection status
router.get('/status', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    
    // Check if we have an active client running
    let isConnected = false;
    const client = await ensureConnectedClient();
    if (client) {
      isConnected = true;
    }

    res.json({
      status: config.status,
      phoneNumber: config.phoneNumber || '',
      apiId: config.apiId || '',
      isConnected
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/telegram/send-code - Start Auth
router.post('/send-code', async (req, res) => {
  const { apiId, apiHash, phoneNumber } = req.body;
  
  if (!apiId || !apiHash || !phoneNumber) {
    return res.status(400).json({ message: 'apiId, apiHash, and phoneNumber are required.' });
  }

  try {
    const config = await getOrCreateConfig();
    config.apiId = apiId;
    config.apiHash = apiHash;
    config.phoneNumber = phoneNumber;
    config.status = 'PendingCode';

    // Disconnect old client if exists
    if (activeClient) {
      await activeClient.disconnect();
      activeClient = null;
    }

    const client = new TelegramClient(new StringSession(""), Number(apiId), apiHash, { 
      connectionRetries: 5,
    });
    
    // Enable verbose logging on this specific client instance
    client.setLogLevel('debug');
    
    console.log(`[TelegramAuth] Connecting to Telegram servers...`);
    await client.connect();
    console.log(`[TelegramAuth] Connected. Attempting to send code to ${phoneNumber}...`);

    // Use the high-level GramJS wrapper which handles DC migrations much more reliably
    const result = await client.sendCode(
      {
        apiId: Number(apiId),
        apiHash: apiHash,
      },
      phoneNumber
    );

    config.phoneCodeHash = result.phoneCodeHash;
    await config.save();

    // Store temporarily to use during verify (GramJS needs the exact same client instance sometimes, or just the same string session which is empty here)
    // Actually, GramJS recommends keeping the same client instance to verify.
    req.app.locals.pendingTelegramClient = client;

    console.log(`[TelegramAuth] Code successfully dispatched! phoneCodeHash: ${result.phoneCodeHash}`);
    res.json({ message: 'Code sent to Telegram app.' });
  } catch (err) {
    console.error('[TelegramAuth] FATAL send-code error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/telegram/verify-code - Finish Auth
router.post('/verify-code', async (req, res) => {
  const { code, password } = req.body;
  if (!code) return res.status(400).json({ message: 'code is required.' });

  try {
    const config = await getOrCreateConfig();
    if (!config.phoneCodeHash) {
      return res.status(400).json({ message: 'No pending auth request. Send code first.' });
    }

    // Retrieve the client created in send-code
    let client = req.app.locals.pendingTelegramClient;
    
    if (!client) {
      // Reconnect if memory was cleared
      client = new TelegramClient(new StringSession(""), Number(config.apiId), config.apiHash, { connectionRetries: 5 });
      await client.connect();
    }

    try {
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber: config.phoneNumber,
          phoneCodeHash: config.phoneCodeHash,
          phoneCode: code,
        })
      );
    } catch (err) {
      if (err.errorMessage === 'SESSION_PASSWORD_NEEDED') {
          if (!password) {
              return res.status(403).json({ message: '2FA Password Required', requiresPassword: true });
          }
          await client.signInWithPassword({
              apiId: Number(config.apiId),
              apiHash: config.apiHash
          }, { password, onError: (e) => { throw e; } });
      } else {
          throw err;
      }
    }

    // Get the generated session string
    const sessionString = client.session.save();

    config.sessionString = sessionString;
    config.phoneCodeHash = '';
    config.status = 'Connected';
    await config.save();

    activeClient = client;
    req.app.locals.pendingTelegramClient = null;

    // Start live polling and gap sync
    const scraper = require('../telegram/scraper');
    scraper.startLivePolling();

    const TelegramChannel = require('../models/TelegramChannel');
    TelegramChannel.find().then(channels => {
      console.log(`[TG Scraper] Booting up gap sync for ${channels.length} channels...`);
      channels.forEach(ch => scraper.startHistoricalScrape(ch._id));
    }).catch(e => console.error('[TG Scraper] Gap sync init failed:', e));

    res.json({ message: 'Authenticated successfully!', sessionString });
  } catch (err) {
    console.error('Telegram verify-code error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/telegram/disconnect
router.post('/disconnect', async (req, res) => {
  try {
    if (activeClient) {
      await activeClient.disconnect();
      activeClient = null;
    }
    const config = await getOrCreateConfig();
    config.sessionString = '';
    config.status = 'Disconnected';
    await config.save();
    res.json({ message: 'Disconnected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, getActiveClient: () => activeClient, ensureConnectedClient };

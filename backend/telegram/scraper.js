const { Api } = require('telegram');
const { getActiveClient, ensureConnectedClient } = require('../routes/telegramAuth');
const TelegramChannel = require('../models/TelegramChannel');
const TelegramMessage = require('../models/TelegramMessage');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Global event emitter for Server-Sent Events (SSE)
const scraperEvents = new EventEmitter();

const STORAGE_PATH = path.join(__dirname, '../storage/telegram');
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

const MAX_BASE64_SIZE = 10 * 1024 * 1024; // 10 MB

async function validateAndJoinChannel(channelUrl) {
  const client = await ensureConnectedClient();
  if (!client || !client.connected) {
    throw new Error('MTProto client is not connected. Please authenticate first.');
  }

  let entity;
  let isPrivate = false;

  try {
    if (channelUrl.includes('joinchat/') || channelUrl.includes('+')) {
      // Private invite link
      const hash = channelUrl.split('/').pop().replace('+', '');
      isPrivate = true;
      console.log(`[TG Scraper] Attempting to join private channel via hash: ${hash}`);
      
      const updates = await client.invoke(new Api.messages.ImportChatInvite({ hash }));
      entity = updates.chats[0];
    } else {
      // Public channel
      const username = channelUrl.split('/').pop();
      console.log(`[TG Scraper] Attempting to join public channel: ${username}`);
      
      // Resolve entity first
      entity = await client.getEntity(username);
      await client.invoke(new Api.channels.JoinChannel({ channel: entity }));
    }
    
    return {
      success: true,
      channelName: entity.title || entity.username || 'Unknown Channel',
      entityId: entity.id.toString(),
      accessHash: entity.accessHash ? entity.accessHash.toString() : null
    };

  } catch (err) {
    if (err.errorMessage === 'USER_ALREADY_PARTICIPANT') {
      const hash = channelUrl.split('/').pop().replace('+', '');
      const inviteData = await client.invoke(new Api.messages.CheckChatInvite({ hash }));
      entity = inviteData.chat;
    } else {
      console.error('[TG Scraper] Error joining channel:', err);
      throw new Error(`Failed to join channel: ${err.message}`);
    }
  }

  // Fetch Branding Intel
  let description = '';
  let profilePicBase64 = '';
  let admins = [];

  try {
    const fullChat = await client.invoke(new Api.channels.GetFullChannel({ channel: entity }));
    description = fullChat.fullChat.about || '';
  } catch (e) {
    console.error('[TG Scraper] Could not fetch full channel info:', e.message);
  }

  try {
    const buffer = await client.downloadProfilePhoto(entity);
    if (buffer) {
      profilePicBase64 = buffer.toString('base64');
    }
  } catch (e) {
    console.error('[TG Scraper] Could not download profile photo:', e.message);
  }

  try {
    const participants = await client.invoke(
      new Api.channels.GetParticipants({
        channel: entity,
        filter: new Api.ChannelParticipantsAdmins(),
        offset: 0,
        limit: 100,
        hash: 0
      })
    );
    if (participants && participants.users) {
      admins = participants.users.map(u => ({
        tgId: u.id.toString(),
        username: u.username || '',
        name: u.firstName || u.title || 'Unknown'
      }));
    }
  } catch (e) {
    console.log('[TG Scraper] Admins hidden or not accessible (expected for public channels).');
  }

  return {
    success: true,
    channelName: entity.title || entity.username || 'Unknown Channel',
    entityId: entity.id.toString(),
    accessHash: entity.accessHash ? entity.accessHash.toString() : null,
    description,
    profilePicBase64,
    admins
  };
}

async function processMessage(client, dbChannel, tgMsg) {
  if (!tgMsg) return false;

  // Check if we already have this message (Gap Sync detection)
  const exists = await TelegramMessage.findOne({ channelId: dbChannel._id, tgMessageId: tgMsg.id });
  if (exists) return true; // Returns true to indicate we reached known history!

  const newMsg = new TelegramMessage({
    channelId: dbChannel._id,
    tgMessageId: tgMsg.id,
    text: tgMsg.message || '',
    date: new Date(tgMsg.date * 1000),
  });

  // Extract Sender
  if (tgMsg.sender) {
    newMsg.senderId = tgMsg.sender.id ? tgMsg.sender.id.toString() : null;
    newMsg.senderName = tgMsg.sender.username || tgMsg.sender.firstName || tgMsg.sender.title || 'Unknown';
  }

  // Handle Media
  if (tgMsg.media) {
    newMsg.hasMedia = true;
    let ext = '.bin';
    if (tgMsg.photo) {
      newMsg.mediaType = 'photo';
      ext = '.jpg';
    } else if (tgMsg.document) {
      newMsg.mediaType = tgMsg.document.mimeType.includes('video') ? 'video' : 'document';
      // Try to extract filename
      const attributes = tgMsg.document.attributes || [];
      const fileAttr = attributes.find(a => a.className === 'DocumentAttributeFilename');
      if (fileAttr) {
        ext = path.extname(fileAttr.fileName) || ext;
        newMsg.fileName = fileAttr.fileName;
      }
      if (newMsg.mediaType === 'video' && ext === '.bin') ext = '.mp4';
    }

    try {
      console.log(`[TG Scraper] Downloading media for msg ${tgMsg.id}...`);
      const buffer = await client.downloadMedia(tgMsg);
      if (buffer) {
        if (buffer.length <= MAX_BASE64_SIZE) {
          // Save small files directly as Base64 in MongoDB
          newMsg.mediaBase64 = buffer.toString('base64');
        } else {
          // Save large files to local disk
          const filename = `${dbChannel._id}_${tgMsg.id}${ext}`;
          const filepath = path.join(STORAGE_PATH, filename);
          fs.writeFileSync(filepath, buffer);
          newMsg.mediaLocalPath = filename;
          console.log(`[TG Scraper] Saved large media to ${filepath}`);
        }
      }
    } catch (e) {
      console.error(`[TG Scraper] Failed to download media for msg ${tgMsg.id}:`, e.message);
    }
  }

  await newMsg.save();

  // Populate channelId for SSE live feed
  const populatedMsg = newMsg.toObject();
  populatedMsg.channelId = { 
    _id: dbChannel._id, 
    channelName: dbChannel.channelName, 
    channelUrl: dbChannel.channelUrl 
  };

  // Broadcast to SSE clients
  scraperEvents.emit('newMessage', { forumId: dbChannel.forumId, message: populatedMsg });
  
  return false; // Did not exist previously
}

async function startHistoricalScrape(dbChannelId) {
  const client = await ensureConnectedClient();
  if (!client || !client.connected) return;

  const dbChannel = await TelegramChannel.findById(dbChannelId);
  if (!dbChannel) return;

  console.log(`[TG Scraper] Starting historical scrape for ${dbChannel.channelName}...`);

  try {
    // Check for branding updates at the start of a gap sync / force sync
    await checkBrandingUpdates(client, dbChannel);

    let entity;
    
    // GramJS expects channel IDs to be prefixed with -100 for getEntity
    let entityIdStr = dbChannel.tgEntityId;
    if (entityIdStr && !entityIdStr.startsWith('-100')) {
      entityIdStr = '-100' + entityIdStr;
    }

    try {
      entity = await client.getEntity(entityIdStr);
    } catch (e) {
      console.log(`[TG Scraper] getEntity by ID failed, falling back to URL...`);
      if (dbChannel.channelUrl.includes('joinchat/') || dbChannel.channelUrl.includes('+')) {
        // This often fails for private links, but we try as a last resort
        entity = await client.getEntity(dbChannel.channelUrl);
      } else {
        const username = dbChannel.channelUrl.split('/').pop();
        entity = await client.getEntity(username);
      }
    }

    // Iterate over messages (reverse: false means newest first!)
    for await (const message of client.iterMessages(entity, { reverse: false })) { 
      const didExist = await processMessage(client, dbChannel, message);
      if (didExist) {
        console.log(`[TG Scraper] Reached known history for ${dbChannel.channelName}. Gap sync complete!`);
        break; // Stop syncing once we hit a message we already have
      }
    }
    
    console.log(`[TG Scraper] Completed historical scrape for ${dbChannel.channelName}.`);
  } catch (err) {
    console.error(`[TG Scraper] Historical scrape failed for ${dbChannel.channelName}:`, err);
  }
}

let isLivePollingEnabled = false;

async function checkBrandingUpdates(client, dbChannel) {
  try {
    let entityIdStr = dbChannel.tgEntityId;
    if (entityIdStr && !entityIdStr.startsWith('-100')) {
      entityIdStr = '-100' + entityIdStr;
    }

    let entity;
    try {
      entity = await client.getEntity(entityIdStr);
    } catch (err) {
      if (dbChannel.channelUrl && (dbChannel.channelUrl.includes('joinchat/') || dbChannel.channelUrl.includes('+'))) {
        entity = await client.getEntity(dbChannel.channelUrl);
      } else if (dbChannel.channelUrl) {
        const username = dbChannel.channelUrl.split('/').pop();
        entity = await client.getEntity(username);
      } else {
        throw err;
      }
    }
    
    let changed = false;
    
    // Check name
    const newName = entity.title || entity.username;
    if (newName && newName !== dbChannel.channelName) {
      dbChannel.changeLog.push({ changeType: 'NAME_CHANGE', oldValue: dbChannel.channelName, newValue: newName });
      dbChannel.channelName = newName;
      console.log(`[TG Scraper] Channel ${dbChannel.tgEntityId} changed name to ${newName}`);
      changed = true;
    }

    // Check description
    const fullChat = await client.invoke(new Api.channels.GetFullChannel({ channel: entity }));
    const newDesc = fullChat.fullChat.about || '';
    if (newDesc !== (dbChannel.description || '')) {
      dbChannel.changeLog.push({ changeType: 'DESC_CHANGE', oldValue: dbChannel.description, newValue: newDesc });
      dbChannel.description = newDesc;
      console.log(`[TG Scraper] Channel ${dbChannel.tgEntityId} changed description.`);
      changed = true;
    }

    // Check profile pic
    const buffer = await client.downloadProfilePhoto(entity);
    if (buffer) {
      const newPic = buffer.toString('base64');
      if (newPic !== dbChannel.profilePicBase64) {
        dbChannel.changeLog.push({ changeType: 'PIC_CHANGE', oldValue: 'old_pic', newValue: 'new_pic' });
        dbChannel.profilePicBase64 = newPic;
        console.log(`[TG Scraper] Channel ${dbChannel.tgEntityId} changed profile picture.`);
        changed = true;
      }
    }

    if (changed) {
      await dbChannel.save();
      // Inform the UI to refresh its branding cards via the SSE Tunnel!
      scraperEvents.emit('newMessage', { forumId: dbChannel.forumId, message: { _id: 'UPDATE_CHANNELS' } });
    }
  } catch (e) {
    console.error(`[TG Scraper] Failed to check branding updates for ${dbChannel.tgEntityId}:`, e.message);
  }
}

function startLivePolling() {
  const client = getActiveClient();
  if (!client || !client.connected) return;
  
  if (isLivePollingEnabled) return;
  isLivePollingEnabled = true;

  console.log('[TG Scraper] Live polling listener enabled.');
  
  client.addEventHandler(async (event) => {
    try {
      // Handle Channel Updates (name, pic, desc changes)
      if (event.className === 'UpdateChannel' || event.className === 'UpdateChat') {
        const chatId = event.channelId ? event.channelId.toString() : (event.chatId ? event.chatId.toString() : null);
        if (chatId) {
          const dbChannel = await TelegramChannel.findOne({ tgEntityId: chatId });
          if (dbChannel) {
            console.log(`[TG Scraper] UpdateChannel event for ${dbChannel.channelName}, checking for branding changes...`);
            await checkBrandingUpdates(client, dbChannel);
          }
        }
        return;
      }

      if (event.className === 'UpdateShortMessage' || event.className === 'UpdateNewChannelMessage' || event.className === 'UpdateNewMessage') {
        const msg = event.message;
        if (!msg || !msg.peerId) return;

        // Find which monitored channel this belongs to
        let chatId;
        if (msg.peerId.channelId) chatId = msg.peerId.channelId.toString();
        else if (msg.peerId.chatId) chatId = msg.peerId.chatId.toString();
        else if (msg.peerId.userId) chatId = msg.peerId.userId.toString();
        
        if (!chatId) return;

        // In a real production environment, you would map TG ID to DB Channel.
        // Since we didn't store TG entity ID in TelegramChannel schema initially, we can do a reverse lookup or store it.
        // Let's assume we update the schema to store `tgEntityId`. For now, we will query all channels and match URLs.
        // A better approach is to modify the `channels.js` to save the tgEntityId returned from `validateAndJoinChannel`.
        
        // Let's just find the DB channel by fetching it. This requires the dbChannel to have `tgEntityId`.
        const dbChannel = await TelegramChannel.findOne({ tgEntityId: chatId });
        if (dbChannel) {
          console.log(`[TG Scraper] Live msg received for ${dbChannel.channelName}`);
          await processMessage(client, dbChannel, msg);
        }
      }
    } catch (e) {
      console.error('[TG Scraper] Error in live listener:', e);
    }
  });
}

module.exports = {
  validateAndJoinChannel,
  startHistoricalScrape,
  startLivePolling,
  scraperEvents
};

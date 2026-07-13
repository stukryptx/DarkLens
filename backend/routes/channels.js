const express = require('express');
const router = express.Router();
const TelegramChannel = require('../models/TelegramChannel');
const TelegramMessage = require('../models/TelegramMessage');

// Get channels (with optional forumId filter)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.forumId ? { forumId: req.query.forumId } : {};
    const channels = await TelegramChannel.find(filter)
      .populate('forumId', 'name')
      .sort({ createdAt: -1 });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SSE Live Stream for messages
router.get('/stream/:forumId', (req, res) => {
  const { scraperEvents } = require('../telegram/scraper');
  const forumId = req.params.forumId;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection success
  res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);

  const onNewMessage = (data) => {
    // Only send if the message belongs to a channel monitored by THIS forum
    if (data.forumId && data.forumId.toString() === forumId) {
      res.write(`data: ${JSON.stringify(data.message)}\n\n`);
    }
  };

  scraperEvents.on('newMessage', onNewMessage);

  req.on('close', () => {
    scraperEvents.off('newMessage', onNewMessage);
  });
});


// Get messages for a forum
router.get('/messages/:forumId', async (req, res) => {
  try {
    const channels = await TelegramChannel.find({ forumId: req.params.forumId });
    const channelIds = channels.map(c => c._id);
    
    const messages = await TelegramMessage.find({ channelId: { $in: channelIds } })
      .populate('channelId', 'channelName channelUrl')
      .sort({ date: -1 })
      .limit(500);
      
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Force Sync Messages for a forum
router.post('/sync/:forumId', async (req, res) => {
  try {
    const { startHistoricalScrape } = require('../telegram/scraper');
    const channels = await TelegramChannel.find({ forumId: req.params.forumId });
    
    // Trigger gap sync for all channels asynchronously
    channels.forEach(ch => {
      startHistoricalScrape(ch._id).catch(e => console.error(e));
    });
    
    res.json({ message: 'Force sync initiated for all channels.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a channel
router.post('/', async (req, res) => {
  try {
    const { validateAndJoinChannel, startHistoricalScrape } = require('../telegram/scraper');
    
    // 1. Validate and join the channel using MTProto
    const tgInfo = await validateAndJoinChannel(req.body.channelUrl);

    const channel = new TelegramChannel({
      channelName: tgInfo.channelName, // Overwrite with real name from Telegram
      channelUrl: req.body.channelUrl,
      tgEntityId: tgInfo.entityId,
      forumId: req.body.forumId,
      notes: req.body.notes,
      description: tgInfo.description,
      profilePicBase64: tgInfo.profilePicBase64,
      admins: tgInfo.admins
    });

    const newChannel = await channel.save();
    
    // 2. Trigger background historical scraping
    startHistoricalScrape(newChannel._id);

    res.status(201).json(newChannel);
  } catch (err) {
    console.error('Error adding channel:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a channel
router.delete('/:id', async (req, res) => {
  try {
    await TelegramChannel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Channel deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

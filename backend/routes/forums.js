const express = require('express');
const router = express.Router();
const Forum = require('../models/Forum');

// Helper to auto-migrate old URL fields to the new array format
const autoMigrateUrls = async (forum) => {
  if ((!forum.urls || forum.urls.length === 0) && (forum.surfaceUrl || forum.onionUrl)) {
    const newUrls = [];
    if (forum.surfaceUrl) {
      let label = 'Surface';
      try { label = new URL(forum.surfaceUrl).hostname; } catch(e) {}
      newUrls.push({ url: forum.surfaceUrl, label, type: 'surface', isDefault: true, isMonitorOnly: false });
    }
    if (forum.onionUrl) {
      newUrls.push({ url: forum.onionUrl, label: 'Onion', type: 'onion', isDefault: newUrls.length === 0, isMonitorOnly: false });
    }
    forum.urls = newUrls;
    await forum.save();
  }
  return forum;
};

// Get all forums
router.get('/', async (req, res) => {
  try {
    const forums = await Forum.find().sort({ createdAt: -1 });
    const migratedForums = await Promise.all(forums.map(f => autoMigrateUrls(f)));
    res.json(migratedForums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific forum
router.get('/:id', async (req, res) => {
  try {
    let forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: 'Forum not found' });
    forum = await autoMigrateUrls(forum);
    res.json(forum);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a forum
router.post('/', async (req, res) => {
  const forum = new Forum({
    name: req.body.name,
    surfaceUrl: req.body.surfaceUrl,
    onionUrl: req.body.onionUrl,
    logoUrl: req.body.logoUrl,
    tags: req.body.tags,
    description: req.body.description
  });
  try {
    const newForum = await forum.save();
    res.status(201).json(newForum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a forum
router.put('/:id', async (req, res) => {
  try {
    const updatedForum = await Forum.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedForum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a forum
router.delete('/:id', async (req, res) => {
  try {
    const cascade = req.query.cascade === 'true';
    const forumId = req.params.id;

    await Forum.findByIdAndDelete(forumId);

    if (cascade) {
      const Identity = require('../models/Identity');
      const TelegramChannel = require('../models/TelegramChannel');
      const TelegramMessage = require('../models/TelegramMessage');
      const Note = require('../models/Note');
      const SavedPost = require('../models/SavedPost');
      const DNSHealthLog = require('../models/DNSHealthLog');

      await Identity.deleteMany({ forumId });
      
      const channels = await TelegramChannel.find({ forumId });
      for (const ch of channels) {
        await TelegramMessage.deleteMany({ channelId: ch._id });
        await ch.deleteOne();
      }

      await Note.deleteMany({ linkedForumId: forumId });
      await SavedPost.deleteMany({ forumId });
      await DNSHealthLog.deleteMany({ forumId });
    }

    res.json({ message: 'Forum deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const SavedPost = require('../models/SavedPost');

// Get saved posts (with optional forumId filter)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.forumId ? { linkedForumId: req.query.forumId } : {};
    const posts = await SavedPost.find(filter)
      .populate('linkedForumId', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a saved post
router.post('/', async (req, res) => {
  const post = new SavedPost({
    title: req.body.title,
    url: req.body.url,
    note: req.body.note,
    linkedForumId: req.body.linkedForumId
  });
  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a saved post
router.delete('/:id', async (req, res) => {
  try {
    await SavedPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Saved post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a saved post (notes)
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await SavedPost.findByIdAndUpdate(
      req.params.id,
      { note: req.body.note },
      { new: true }
    );
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

router.get('/', async (req, res) => {
  try {
    const filter = req.query.forumId ? { linkedForumId: req.query.forumId } : {};
    const notes = await Note.find(filter)
      .populate('linkedForumId', 'name')
      .populate('linkedIdentityId', 'identityName')
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content,
    linkedForumId: req.body.linkedForumId,
    linkedIdentityId: req.body.linkedIdentityId,
    tags: req.body.tags
  });
  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags
      },
      { new: true } // Return the updated document
    );
    if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

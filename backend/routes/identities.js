const express = require('express');
const router = express.Router();
const Identity = require('../models/Identity');

// Get all identities
router.get('/', async (req, res) => {
  try {
    const filter = req.query.forumId ? { forumId: req.query.forumId } : {};
    const identities = await Identity.find(filter).populate('forumId', 'name');
    res.json(identities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create an identity
router.post('/', async (req, res) => {
  const identity = new Identity({
    identityName: req.body.identityName,
    forumId: req.body.forumId,
    notes: req.body.notes
  });
  try {
    const newIdentity = await identity.save();
    res.status(201).json(newIdentity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an identity
router.put('/:id', async (req, res) => {
  try {
    const updatedIdentity = await Identity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedIdentity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an identity
router.delete('/:id', async (req, res) => {
  try {
    await Identity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Identity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

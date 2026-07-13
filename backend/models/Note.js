const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  linkedForumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' },
  linkedIdentityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Identity' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);

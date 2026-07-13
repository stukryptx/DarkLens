const mongoose = require('mongoose');

const savedPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  note: { type: String },
  screenshotBase64: { type: String },
  linkedForumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedPost', savedPostSchema);

const mongoose = require('mongoose');

const identitySchema = new mongoose.Schema({
  identityName: { type: String, required: true },
  forumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
  notes: { type: String },
  lastLogin: { type: Date },
  status: { type: String, default: 'Active' },
  sessionCookies: { type: String }, // JSON-serialized cookies
  sessionStorage: { type: String }, // JSON-serialized Playwright storageState
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Identity', identitySchema);

const mongoose = require('mongoose');

const urlEntrySchema = new mongoose.Schema({
  url: { type: String, required: true },
  label: { type: String, default: 'Surface' }, // e.g. 'Surface', 'Onion', 'Mirror 1'
  type: { type: String, enum: ['surface', 'onion', 'other'], default: 'surface' },
  isDefault: { type: Boolean, default: false },   // used when launching browser
  isMonitorOnly: { type: Boolean, default: false } // passive monitoring, not for auth
}, { _id: true });

const forumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Legacy fields kept for compatibility, new installs use urls[]
  surfaceUrl: { type: String },
  onionUrl: { type: String },
  // New multi-URL support
  urls: [urlEntrySchema],
  logoUrl: { type: String },
  tags: [{ type: String }],
  description: { type: String },
  useTor: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Forum', forumSchema);

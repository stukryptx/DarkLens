const mongoose = require('mongoose');

const dnsHealthLogSchema = new mongoose.Schema({
  forumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
  hostname: { type: String, required: true },
  date: { type: Date, default: Date.now },
  records: {
    a: [{ type: String }],
    mx: [{ type: String }],
    ns: [{ type: String }],
    txt: [{ type: String }]
  },
  changes: [{ type: String }] // Textual description of what changed (e.g. "A record added: 1.1.1.1")
});

// Index to quickly fetch history for a forum
dnsHealthLogSchema.index({ forumId: 1, hostname: 1, date: -1 });

module.exports = mongoose.model('DNSHealthLog', dnsHealthLogSchema);

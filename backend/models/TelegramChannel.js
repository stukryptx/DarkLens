const mongoose = require('mongoose');

const telegramChannelSchema = new mongoose.Schema({
  channelName: { type: String, required: true },
  channelUrl: { type: String, required: true },
  tgEntityId: { type: String }, // Telegram's internal ID for the channel
  forumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' },
  status: { type: String, default: 'Monitoring' },
  notes: { type: String },

  // Branding Intel
  description: { type: String },
  profilePicBase64: { type: String },
  admins: [{
    tgId: { type: String },
    username: { type: String },
    name: { type: String }
  }],
  changeLog: [{
    changeType: { type: String }, // 'NAME_CHANGE', 'PIC_CHANGE', 'DESC_CHANGE'
    oldValue: { type: String },
    newValue: { type: String },
    date: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TelegramChannel', telegramChannelSchema);

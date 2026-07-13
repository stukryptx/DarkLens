const mongoose = require('mongoose');

const telegramMessageSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'TelegramChannel', required: true },
  tgMessageId: { type: Number, required: true }, // The message ID from Telegram
  text: { type: String },
  caption: { type: String },
  senderName: { type: String },
  senderId: { type: String },
  date: { type: Date },
  
  // Media handling
  hasMedia: { type: Boolean, default: false },
  mediaType: { type: String }, // e.g. 'photo', 'video', 'document', 'voice'
  fileName: { type: String }, // Original filename if available
  mediaLocalPath: { type: String }, // For files > 10MB stored on disk
  mediaBase64: { type: String }, // For files < 10MB stored in DB

  // Geolocation
  location: {
    lat: { type: Number },
    long: { type: Number }
  },

  scrapedAt: { type: Date, default: Date.now }
});

// Compound index to ensure we don't save duplicate messages for the same channel
telegramMessageSchema.index({ channelId: 1, tgMessageId: 1 }, { unique: true });

module.exports = mongoose.model('TelegramMessage', telegramMessageSchema);

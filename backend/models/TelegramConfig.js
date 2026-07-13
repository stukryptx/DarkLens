const mongoose = require('mongoose');

const telegramConfigSchema = new mongoose.Schema({
  // Global config record identifier (since we are doing single account)
  configId: { type: String, default: 'global', unique: true },
  
  // App credentials
  apiId: { type: String, required: true },
  apiHash: { type: String, required: true },
  
  // User credentials
  phoneNumber: { type: String, required: true },
  
  // Auth state
  sessionString: { type: String, default: '' }, // GramJS string session
  status: { type: String, enum: ['Disconnected', 'PendingCode', 'Connected'], default: 'Disconnected' },
  
  // Temporary storage during auth flow
  phoneCodeHash: { type: String, default: '' },
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TelegramConfig', telegramConfigSchema);

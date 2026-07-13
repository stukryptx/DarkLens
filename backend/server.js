const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/storage', express.static(require('path').join(__dirname, 'storage')));

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/threat-research-db';
mongoose.connect(uri)
  .then(() => console.log('MongoDB connection established successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRouter = require('./routes/auth');
const forumsRouter = require('./routes/forums');
const identitiesRouter = require('./routes/identities');
const notesRouter = require('./routes/notes');
const savedPostsRouter = require('./routes/savedPosts');
const channelsRouter = require('./routes/channels');
const sessionsRouter = require('./routes/sessions');
const diagnosisRouter = require('./routes/diagnosis');
const telegramRouter = require('./routes/telegramAuth').router;

// Public route
app.use('/api/auth', authRouter);

// Protect subsequent routes
const authMiddleware = require('./middleware/authMiddleware');
app.use('/api/forums', authMiddleware, forumsRouter);
app.use('/api/identities', authMiddleware, identitiesRouter);
app.use('/api/notes', authMiddleware, notesRouter);
app.use('/api/saved-posts', authMiddleware, savedPostsRouter);
app.use('/api/channels', authMiddleware, channelsRouter);
app.use('/api/sessions', authMiddleware, sessionsRouter);
app.use('/api/diagnosis', authMiddleware, diagnosisRouter);
app.use('/api/telegram', authMiddleware, telegramRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  
  // Start background jobs
  const { startDnsMonitor } = require('./jobs/dnsMonitor');
  startDnsMonitor();
});

const express = require('express');
const router = express.Router();
const dns = require('dns').promises;
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Helper: HTTP/HTTPS GET with timeout, returns { status, latencyMs, ok }
function pingUrl(rawUrl) {
  return new Promise((resolve) => {
    const start = Date.now();
    let parsed;
    try { parsed = new URL(rawUrl); } catch (_) {
      return resolve({ ok: false, status: null, latencyMs: null, error: 'Invalid URL' });
    }
    const proto = parsed.protocol === 'https:' ? https : http;
    const req = proto.get(rawUrl, { timeout: 7000, rejectUnauthorized: false }, (res) => {
      const latencyMs = Date.now() - start;
      resolve({ ok: true, status: res.statusCode, latencyMs });
      res.resume();
    });
    req.on('error', (err) => resolve({ ok: false, status: null, latencyMs: null, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: null, latencyMs: null, error: 'Timeout' }); });
  });
}

// Helper: DNS lookup for a hostname
async function dnsLookup(hostname) {
  try {
    const [addresses, mx, ns, txt] = await Promise.allSettled([
      dns.resolve4(hostname),
      dns.resolveMx(hostname),
      dns.resolveNs(hostname),
      dns.resolveTxt(hostname),
    ]);
    return {
      a: addresses.status === 'fulfilled' ? addresses.value : [],
      mx: mx.status === 'fulfilled' ? mx.value.map(r => r.exchange) : [],
      ns: ns.status === 'fulfilled' ? ns.value : [],
      txt: txt.status === 'fulfilled' ? txt.value.map(r => r.join('')) : [],
    };
  } catch (err) {
    return { error: err.message };
  }
}

const { processForumDns } = require('../jobs/dnsMonitor');
const Forum = require('../models/Forum');

// POST /api/diagnosis/sync/:forumId
router.post('/sync/:forumId', async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.forumId);
    if (!forum) return res.status(404).json({ message: 'Forum not found' });
    
    await processForumDns(forum);
    res.json({ message: 'DNS sync complete', syncedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ message: 'Error syncing DNS', error: err.message });
  }
});

const DNSHealthLog = require('../models/DNSHealthLog');

// GET /api/diagnosis/history/:forumId
router.get('/history/:forumId', async (req, res) => {
  try {
    const history = await DNSHealthLog.find({ forumId: req.params.forumId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching DNS history', error: err.message });
  }
});

module.exports = router;

const dns = require('dns').promises;
const { URL } = require('url');
const Forum = require('../models/Forum');
const DNSHealthLog = require('../models/DNSHealthLog');

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
      a: addresses.status === 'fulfilled' ? addresses.value.sort() : [],
      mx: mx.status === 'fulfilled' ? mx.value.map(r => r.exchange).sort() : [],
      ns: ns.status === 'fulfilled' ? ns.value.sort() : [],
      txt: txt.status === 'fulfilled' ? txt.value.map(r => r.join('')).sort() : [],
    };
  } catch (err) {
    return { error: err.message };
  }
}

// Helper to compare two sets of DNS records
function compareDns(oldRecords, newRecords) {
  const changes = [];
  
  if (!oldRecords || !newRecords) return ['Initial DNS capture or Error occurred.'];
  if (newRecords.error) return [`DNS Error: ${newRecords.error}`];

  const types = ['a', 'mx', 'ns', 'txt'];
  for (const type of types) {
    const oldSet = new Set(oldRecords[type] || []);
    const newSet = new Set(newRecords[type] || []);
    
    for (const val of newSet) {
      if (!oldSet.has(val)) changes.push(`[${type.toUpperCase()}] Added: ${val}`);
    }
    for (const val of oldSet) {
      if (!newSet.has(val)) changes.push(`[${type.toUpperCase()}] Removed: ${val}`);
    }
  }

  return changes;
}

async function processForumDns(forum) {
  if (!forum.urls || forum.urls.length === 0) return;

  for (const urlEntry of forum.urls) {
    if (urlEntry.url.includes('.onion')) continue;

    let hostname;
    try { hostname = new URL(urlEntry.url).hostname; } catch (_) { continue; }

    const dnsRecords = await dnsLookup(hostname);
    
    // Skip if total failure on first grab, though we might still want to log an outage
    if (dnsRecords.error) continue;

    // Fetch latest log
    const latestLog = await DNSHealthLog.findOne({ forumId: forum._id, hostname }).sort({ date: -1 });

    let changes = [];
    if (!latestLog) {
      changes = ['Initial DNS capture.'];
    } else {
      changes = compareDns(latestLog.records, dnsRecords);
    }

    if (changes.length > 0) {
      console.log(`[DNS Monitor] Changes detected for ${hostname}:`, changes);
      const newLog = new DNSHealthLog({
        forumId: forum._id,
        hostname,
        records: dnsRecords,
        changes
      });
      await newLog.save();
    }
  }
}

async function runDnsMonitor() {
  console.log('[DNS Monitor] Starting poll cycle...');
  try {
    const forums = await Forum.find();
    for (const forum of forums) {
      await processForumDns(forum);
    }
    console.log('[DNS Monitor] Poll cycle complete.');
  } catch (err) {
    console.error('[DNS Monitor] Error during poll cycle:', err);
  }
}

let monitorInterval;

function startDnsMonitor() {
  // Run immediately on startup
  runDnsMonitor();
  // Then every 5 minutes
  const FIVE_MINUTES = 5 * 60 * 1000;
  monitorInterval = setInterval(runDnsMonitor, FIVE_MINUTES);
}

module.exports = { startDnsMonitor, runDnsMonitor, processForumDns };

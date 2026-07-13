const express = require('express');
const router = express.Router();
const { chromium } = require('playwright');
const Identity = require('../models/Identity');
const Note = require('../models/Note');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// In-memory map of active sessions: { sessionKey: { browser, context, page } }
const activeSessions = new Map();

// Helper: Setup HUD Injection
async function injectDarkLensHUD(context, forumId, identityName, mode = 'session') {
  const screenshotsDir = path.join(__dirname, '../storage/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  await context.exposeFunction('saveDarkLensNote', async (data) => {
    try {
      const { text, url, title } = data;
      
      let base64Image = null;
      const p = context.__hudPage;
      if (p) {
        await new Promise(r => setTimeout(r, 200)); // Hide HUD delay
        const buffer = await p.screenshot({ fullPage: false });
        base64Image = buffer.toString('base64');
      }

      const SavedPost = require('../models/SavedPost');
      const post = new SavedPost({
        title: title || 'HUD Context Capture',
        note: text,
        url: url,
        screenshotBase64: base64Image,
        linkedForumId: forumId
      });

      await post.save();
      console.log('HUD SavedPost Captured:', post._id);
      return { success: true };
    } catch (err) {
      console.error('HUD Capture Error:', err);
      return { success: false };
    }
  });

  await context.exposeFunction('saveDarkLensSession', async () => {
    try {
      if (!identityName) return { success: false, message: 'No identity name provided' };
      
      const Identity = require('../models/Identity');
      const cookies = await context.cookies();
      const storage = await context.storageState();

      const ident = await Identity.findOneAndUpdate(
        { forumId, identityName },
        {
          forumId,
          identityName,
          sessionCookies: JSON.stringify(cookies),
          sessionStorage: JSON.stringify(storage),
          lastLogin: new Date(),
          status: 'Authenticated'
        },
        { upsert: true, new: true }
      );

      console.log('Session saved from HUD for:', ident.identityName);
      return { success: true };
    } catch (err) {
      console.error('HUD Session Save Error:', err);
      return { success: false, message: err.message };
    }
  });

  const initScript = `
    window.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('darklens-hud')) return;

      const hud = document.createElement('div');
      hud.id = 'darklens-hud';
      const hudMode = '${mode}';
      Object.assign(hud.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '2147483647',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      });

      const fab = document.createElement('button');
      if (hudMode === 'login') {
        fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>';
      } else {
        fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
      }

      Object.assign(fab.style, {
        width: '56px',
        height: '56px',
        borderRadius: '28px',
        backgroundColor: hudMode === 'login' ? '#10b981' : '#3b82f6',
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      });
      
      fab.onmouseover = () => fab.style.transform = 'scale(1.08)';
      fab.onmouseout = () => fab.style.transform = 'scale(1)';

      const modal = document.createElement('div');
      Object.assign(modal.style, {
        display: 'none',
        position: 'absolute',
        bottom: '72px',
        right: '0',
        width: '320px',
        backgroundColor: '#111111',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
      });

      const titleEl = document.createElement('div');
      titleEl.innerText = 'DarkLens Capture';
      Object.assign(titleEl.style, { color: '#ededed', fontSize: '15px', fontWeight: '600', marginBottom: '16px' });

      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Type intelligence note...';
      Object.assign(textarea.style, {
        width: '100%',
        height: '120px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: '#ededed',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        resize: 'none',
        boxSizing: 'border-box',
        fontSize: '14px',
        outline: 'none'
      });
      textarea.onfocus = () => textarea.style.borderColor = '#3b82f6';
      textarea.onblur = () => textarea.style.borderColor = 'rgba(255,255,255,0.1)';

      const saveBtn = document.createElement('button');
      saveBtn.innerText = 'Capture Context & Save';
      Object.assign(saveBtn.style, {
        width: '100%',
        padding: '10px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'background-color 0.2s'
      });

      const saveSessionBtn = document.createElement('button');
      saveSessionBtn.innerText = 'Save Session State';
      Object.assign(saveSessionBtn.style, {
        width: '100%',
        padding: '10px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        marginTop: '10px',
        transition: 'background-color 0.2s'
      });

      modal.appendChild(titleEl);
      modal.appendChild(textarea);
      modal.appendChild(saveBtn);
      modal.appendChild(saveSessionBtn);
      
      if (hudMode === 'login') {
        titleEl.innerText = 'Identity Authentication';
        textarea.style.display = 'none';
        saveBtn.style.display = 'none';
      } else {
        saveSessionBtn.style.display = 'none';
      }
      
      hud.appendChild(modal);
      hud.appendChild(fab);
      document.body.appendChild(hud);

      fab.onclick = () => {
        modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
        if (modal.style.display === 'block') textarea.focus();
      };

      saveBtn.onclick = async () => {
        saveBtn.innerText = 'Saving...';
        saveBtn.style.backgroundColor = '#10b981';
        try {
          hud.style.display = 'none';
          await window.saveDarkLensNote({
            text: textarea.value,
            url: window.location.href,
            title: document.title
          });
          textarea.value = '';
          modal.style.display = 'none';
        } catch (e) {
          console.error(e);
        } finally {
          hud.style.display = 'block';
          saveBtn.innerText = 'Capture Context & Save';
          saveBtn.style.backgroundColor = '#3b82f6';
        }
      };

      saveSessionBtn.onclick = async () => {
        saveSessionBtn.innerText = 'Saving Session...';
        saveSessionBtn.style.backgroundColor = '#059669';
        try {
          const res = await window.saveDarkLensSession();
          if (res && res.success) {
            saveSessionBtn.innerText = 'Session Saved! \u2713';
            setTimeout(() => {
              saveSessionBtn.innerText = 'Save Session State';
              saveSessionBtn.style.backgroundColor = '#10b981';
            }, 2000);
          } else {
            saveSessionBtn.innerText = 'Save Failed';
            saveSessionBtn.style.backgroundColor = '#ef4444';
            setTimeout(() => {
              saveSessionBtn.innerText = 'Save Session State';
              saveSessionBtn.style.backgroundColor = '#10b981';
            }, 2000);
          }
        } catch (e) {
          console.error(e);
          saveSessionBtn.innerText = 'Error';
          saveSessionBtn.style.backgroundColor = '#ef4444';
        }
      };
    });
  `;
  
  await context.addInitScript(initScript);
}

// POST /api/sessions/launch — Launch Playwright window for auth
router.post('/launch', async (req, res) => {
  const { forumId, identityName, url } = req.body;
  if (!forumId || !identityName || !url) {
    return res.status(400).json({ message: 'forumId, identityName, and url are required' });
  }

  const sessionKey = `${forumId}-${identityName}`;

  if (activeSessions.has(sessionKey)) {
    const old = activeSessions.get(sessionKey);
    try { await old.browser.close(); } catch (_) {}
    activeSessions.delete(sessionKey);
  }

  try {
    const Forum = require('../models/Forum');
    const forum = await Forum.findById(forumId);

    const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
    if (forum && forum.useTor) {
      launchArgs.push('--proxy-server=socks5://127.0.0.1:9050');
    }

    const browser = await chromium.launch({
      headless: false,
      channel: 'chrome',
      args: launchArgs
    });

    const context = await browser.newContext({ viewport: null });
    
    await injectDarkLensHUD(context, forumId, identityName, 'login');
    
    const page = await context.newPage();
    context.__hudPage = page; // Track for screenshot
    await page.goto(url);

    activeSessions.set(sessionKey, { browser, context, page });

    res.json({ message: 'Browser launched. Complete login and then click Save Session.', sessionKey });
  } catch (err) {
    console.error('Playwright launch error:', err);
    res.status(500).json({ message: 'Failed to launch browser: ' + err.message });
  }
});

// POST /api/sessions/save — Save cookies from active session
router.post('/save', async (req, res) => {
  const { forumId, identityName } = req.body;
  const sessionKey = `${forumId}-${identityName}`;

  if (!activeSessions.has(sessionKey)) {
    return res.status(404).json({ message: 'No active session found for this identity. Did you launch one?' });
  }

  try {
    const { browser, context } = activeSessions.get(sessionKey);
    const cookies = await context.cookies();
    const storage = await context.storageState();

    const updated = await Identity.findOneAndUpdate(
      { forumId, identityName },
      {
        forumId,
        identityName,
        sessionCookies: JSON.stringify(cookies),
        sessionStorage: JSON.stringify(storage),
        lastLogin: new Date(),
        status: 'Authenticated'
      },
      { upsert: true, new: true }
    );

    await browser.close();
    activeSessions.delete(sessionKey);

    res.json({ message: 'Session saved successfully!', identity: updated });
  } catch (err) {
    console.error('Session save error:', err);
    res.status(500).json({ message: 'Failed to save session: ' + err.message });
  }
});

// POST /api/sessions/open — Restore a saved session and open browser
router.post('/open', async (req, res) => {
  const { forumId, identityName } = req.body;

  try {
    const identity = await Identity.findOne({ forumId, identityName });
    if (!identity || !identity.sessionStorage) {
      return res.status(404).json({ message: 'No saved session found for this identity.' });
    }

    const sessionKey = `${forumId}-${identityName}`;

    if (activeSessions.has(sessionKey)) {
      const old = activeSessions.get(sessionKey);
      try { await old.browser.close(); } catch (_) {}
      activeSessions.delete(sessionKey);
    }

    const storageState = JSON.parse(identity.sessionStorage);

    const Forum = require('../models/Forum');
    const forum = await Forum.findById(forumId);

    const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
    if (forum && forum.useTor) {
      launchArgs.push('--proxy-server=socks5://127.0.0.1:9050');
    }

    const browser = await chromium.launch({
      headless: false,
      channel: 'chrome',
      args: launchArgs
    });

    const context = await browser.newContext({ storageState, viewport: null });
    
    await injectDarkLensHUD(context, forumId, identityName);

    const page = await context.newPage();
    context.__hudPage = page; // Track for screenshot

    const defaultUrlEntry = forum?.urls?.find(u => u.isDefault);
    const url = defaultUrlEntry?.url || forum?.surfaceUrl || forum?.onionUrl;
    if (url) await page.goto(url);

    activeSessions.set(sessionKey, { browser, context, page });

    res.json({ message: `Session restored for ${identityName}. Browser opened.` });
  } catch (err) {
    console.error('Session open error:', err);
    res.status(500).json({ message: 'Failed to restore session: ' + err.message });
  }
});

module.exports = router;

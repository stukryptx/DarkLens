import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import ReactMarkdown from 'react-markdown';
import {
  Send, FileText, Bookmark, ArrowLeft, Plus,
  ShieldCheck, X, User, UserPlus, ExternalLink, Save,
  Settings, Activity, ChevronDown, ChevronUp, Globe, CheckCircle, AlertTriangle, Link as LinkIcon, Play, Copy, Maximize, Trash2, Edit, Check, Search
} from 'lucide-react';
import NoteCard from './NoteCard';

// ─── Full View Saved Post Modal ──────────────────────────────────────────────
const SavedPostModal = ({ post, onClose, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(post.note || '');
  const [savingNote, setSavingNote] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWheel = (e) => {
    // Only zoom if hovering over the image area, prevents scrolling sidebar from zooming
    e.preventDefault();
    setScale(prev => {
      const newScale = prev + e.deltaY * -0.005;
      return Math.min(Math.max(1, newScale), 5); // clamp scale
    });
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await api.updateSavedPost(post._id, { note: editedNote });
      post.note = editedNote; // Optimistic local update
      setIsEditing(false);
    } catch (e) {
      alert("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg-color)',
      zIndex: 2000, display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bookmark size={20} color="var(--accent-color)" />
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{post.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { if (window.confirm('Delete this intelligence?')) { onDelete(post._id); onClose(); } }} className="btn btn-secondary" style={{ padding: '8px 12px', color: 'var(--danger-color)' }} title="Delete">
            <Trash2 size={16} /> Delete
          </button>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '8px 12px' }} title="Close">
            <X size={16} /> Close
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'row' }}>
        
        {/* Screenshot Area */}
        {post.screenshotBase64 ? (
          <div 
            style={{ 
              flex: '2', 
              background: '#050505', 
              overflow: 'auto', 
              display: 'flex', 
              alignItems: 'flex-start',
              justifyContent: 'center',
              borderRight: '1px solid var(--border-color)',
              position: 'relative'
            }}
            onWheel={handleWheel}
          >
            <div style={{ padding: '40px', transformOrigin: 'top center', transform: `scale(${scale})`, transition: 'transform 0.1s ease-out' }}>
              <img 
                src={`data:image/png;base64,${post.screenshotBase64}`} 
                alt="Capture" 
                style={{ 
                  boxShadow: '0 0 32px rgba(0,0,0,0.5)',
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto'
                }} 
              />
            </div>
            
            {/* Zoom Controls Overlay */}
            <div style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '8px', backdropFilter: 'blur(8px)', border: '1px solid var(--border-color)' }}>
              <button onClick={() => setScale(s => Math.max(1, s - 0.25))} className="btn btn-secondary" style={{ padding: '4px' }}>-</button>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', alignSelf: 'center', minWidth: '40px', textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(5, s + 0.25))} className="btn btn-secondary" style={{ padding: '4px' }}>+</button>
            </div>
          </div>
        ) : (
          <div style={{ flex: '2', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', borderRight: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No screenshot available</p>
          </div>
        )}

        {/* Sidebar / Info Area */}
        <div style={{ flex: '1', minWidth: '400px', maxWidth: '500px', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-color)' }}>
          
          {/* Prettified URL Card */}
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--accent-color)' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Source Target</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Globe size={16} color="var(--accent-color)" style={{ flexShrink: 0 }} />
              <a href={post.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                {post.url}
              </a>
              <button onClick={handleCopy} className="btn btn-secondary" style={{ flexShrink: 0, padding: '6px' }} title="Copy URL">
                {copied ? <CheckCircle size={16} color="var(--success-color)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Editable Markdown Notes */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Analyst Notes</label>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                  <Edit size={14} /> Edit
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                <textarea 
                  className="form-input" 
                  style={{ flex: 1, resize: 'none', minHeight: '300px', fontFamily: 'monospace' }}
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  placeholder="Markdown supported..."
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setIsEditing(false); setEditedNote(post.note || ''); }} className="btn btn-secondary">Cancel</button>
                  <button onClick={handleSaveNote} className="btn btn-primary" disabled={savingNote}>
                    {savingNote ? 'Saving...' : <><Save size={16}/> Save Notes</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="markdown-body" style={{ 
                background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', 
                border: '1px solid var(--border-color)', color: 'var(--text-primary)', lineHeight: 1.6,
                flex: 1, overflowY: 'auto'
              }}>
                {post.note ? <ReactMarkdown>{post.note}</ReactMarkdown> : <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No analyst notes provided for this capture.</p>}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

// ─── Auth Modal ──────────────────────────────────────────────────────────────
const AuthModal = ({ forum, onClose, onLaunched }) => {
  const [mode, setMode] = useState('choose'); // 'choose' | 'new'
  const [identities, setIdentities] = useState([]);
  const [newName, setNewName] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getIdentitiesByForum(forum._id).then(r => setIdentities(r.data)).catch(() => {});
  }, [forum._id]);

  // Find default URL, fallback to surfaceUrl or onionUrl
  const defaultUrlEntry = forum.urls?.find(u => u.isDefault);
  const targetUrl = defaultUrlEntry?.url || forum.surfaceUrl || forum.onionUrl || '';

  const handleLaunch = async (identityName) => {
    if (!targetUrl) {
      setError('This forum has no URL configured. Please go to Config and set a default URL.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.launchSession({ forumId: forum._id, identityName, url: targetUrl });
      onLaunched(identityName);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to launch browser.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '480px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
        }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ShieldCheck size={28} color="var(--accent-color)" />
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>Auth Identity</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{forum.name} ({targetUrl || 'No URL set'})</p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            padding: '12px', borderRadius: '8px', marginBottom: '16px',
            color: 'var(--danger-color)', fontSize: '0.9rem'
          }}>{error}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            className={`btn ${mode === 'choose' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }} onClick={() => setMode('choose')}
          >
            <User size={16} /> Choose Identity
          </button>
          <button
            className={`btn ${mode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }} onClick={() => setMode('new')}
          >
            <UserPlus size={16} /> New Identity
          </button>
        </div>

        {mode === 'choose' && (
          <div>
            {identities.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                No existing identities. Create a new one.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {identities.map(id => (
                  <button
                    key={id._id}
                    onClick={() => handleLaunch(id.identityName)}
                    disabled={loading}
                    style={{
                      padding: '14px 16px', background: selectedIdentity === id.identityName
                        ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)', borderRadius: '10px',
                      cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
                      transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{id.identityName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {id.sessionStorage ? '🔐 Session saved' : '⚠️ Not authenticated'}
                      </div>
                    </div>
                    <ExternalLink size={16} color="var(--accent-color)" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'new' && (
          <div>
            <div className="form-group">
              <label className="form-label">Identity Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. agent_sigma, researcher_01"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!newName.trim() || loading}
              onClick={() => handleLaunch(newName.trim())}
            >
              {loading ? 'Launching...' : <><ExternalLink size={16} /> Launch Browser & Login</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Launch Saved Session Modal ───────────────────────────────────────────────
const LaunchModal = ({ forum, onClose, onLaunched }) => {
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.getIdentitiesByForum(forum._id)
      .then(r => setIdentities(r.data.filter(i => i.sessionStorage))) // only show saved sessions
      .catch(() => setError('Failed to load identities.'))
      .finally(() => setFetching(false));
  }, [forum._id]);

  const handleLaunch = async (identityName) => {
    setLoading(true);
    setError('');
    try {
      await api.openSession({ forumId: forum._id, identityName });
      onLaunched(identityName);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore session.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div className="card" style={{ width: '400px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', background: 'transparent',
          border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px'
        }}>
          <X size={20} />
        </button>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={18} color="var(--success-color)"/> Launch Saved Session
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>{forum.name}</p>

        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        {fetching ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading identities...</p>
        ) : identities.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No saved sessions found. Authenticate first to save a session.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {identities.map(id => (
              <button
                key={id._id}
                onClick={() => handleLaunch(id.identityName)}
                disabled={loading}
                style={{
                  padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)', borderRadius: '8px',
                  cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 600 }}>{id.identityName}</span>
                <Play size={14} color="var(--success-color)" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// ─── Main Component ───────────────────────────────────────────────────────────
const ForumDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const match = location.pathname.match(/\/forums\/[^\/]+\/([^\/]+)/);
  let activeTab = match ? match[1] : 'saved';
  const validTabs = ['saved', 'notes', 'telegram', 'config', 'diagnosis'];
  if (!validTabs.includes(activeTab)) {
    activeTab = 'saved';
  }

  const setActiveTab = (tabId) => {
    navigate(`/forums/${id}/${tabId}`);
  };

  const [forum, setForum] = useState(null);
  const [error, setError] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);

  const [channels, setChannels] = useState([]);
  const [tgMessages, setTgMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const [tgForm, setTgForm] = useState({ channelName: '', channelUrl: '' });
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [postForm, setPostForm] = useState({ title: '', url: '', note: '' });
  const [savingSession, setSavingSession] = useState(false);
  const [sessionMsg, setSessionMsg] = useState('');

  // Config Form
  const [urlForm, setUrlForm] = useState({ url: '', label: 'Surface', type: 'surface', isDefault: false, isMonitorOnly: false });
  
  const [runningDiagnosis, setRunningDiagnosis] = useState(false);
  const [dnsHistory, setDnsHistory] = useState([]);
  const [openHistoryId, setOpenHistoryId] = useState(null);

  useEffect(() => { fetchForumData(); }, [id]);

  useEffect(() => {
    if (activeTab === 'telegram') {
      const token = localStorage.getItem('token');
      const eventSource = new EventSource(`http://localhost:5000/api/channels/stream/${id}?token=${token}`);
      
      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data && data._id === 'UPDATE_CHANNELS') {
          fetchForumData();
          return;
        }
        if (data && data._id) {
          // It's a new message! Prepend to state instantly
          setTgMessages(prev => {
            if (prev.find(m => m._id === data._id)) return prev;
            return [data, ...prev];
          });
        }
      };

      return () => {
        eventSource.close();
      };
    }
    
    if (activeTab === 'diagnosis') {
      api.getDnsHistory(id).then(res => setDnsHistory(res.data)).catch(err => console.error('Failed to load DNS history', err));
    }
  }, [activeTab, id]);

  const fetchForumData = async () => {
    const [forumRes, channelsRes, notesRes, postsRes, tgMessagesRes] = await Promise.allSettled([
      api.getForumById(id),
      api.getChannels(id),
      api.getNotes(id),
      api.getSavedPosts(id),
      api.getTelegramMessages(id)
    ]);

    if (forumRes.status === 'rejected') {
      const msg = forumRes.reason?.response?.data?.message || forumRes.reason?.message || 'Unknown error';
      const status = forumRes.reason?.response?.status;
      if (status === 401) {
        setError('Session expired. Please log in again.');
      } else if (status === 404) {
        setError(`Forum not found (ID: ${id}). It may have been deleted. Go back and open it from the Forums list.`);
      } else {
        setError(`Failed to load forum: ${msg} (status ${status || 'no response'})`);
      }
      return;
    }

    setForum(forumRes.value.data);
    setChannels(channelsRes.status === 'fulfilled' ? channelsRes.value.data : []);
    setNotes(notesRes.status === 'fulfilled' ? notesRes.value.data : []);
    setSavedPosts(postsRes.status === 'fulfilled' ? postsRes.value.data : []);
    setTgMessages(tgMessagesRes.status === 'fulfilled' ? tgMessagesRes.value.data : []);
  };

  const handleSaveSession = async () => {
    if (!activeSession) return;
    setSavingSession(true);
    setSessionMsg('');
    try {
      const res = await api.saveSession({ forumId: id, identityName: activeSession });
      setSessionMsg(res.data.message);
      setActiveSession(null);
    } catch (err) {
      setSessionMsg(err.response?.data?.message || 'Save failed.');
    } finally {
      setSavingSession(false);
    }
  };

  const handleDeleteSavedPost = async (id) => {
    if (!window.confirm('Delete this intelligence capture?')) return;
    try {
      await api.deleteSavedPost(id);
      fetchForumData();
    } catch (err) {
      alert('Failed to delete saved post');
    }
  };

  const handleTgSubmit = async (e) => {
    e.preventDefault();
    // Auto-derive channel name from the URL (e.g. t.me/ThreatIntel -> ThreatIntel)
    let parsedName = tgForm.channelUrl;
    try {
      if (tgForm.channelUrl.includes('/')) {
        parsedName = tgForm.channelUrl.split('/').filter(Boolean).pop();
      }
    } catch (_) {}

    await api.createChannel({ channelUrl: tgForm.channelUrl, channelName: parsedName, forumId: id });
    setTgForm({ channelName: '', channelUrl: '' });
    fetchForumData();
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    await api.createNote({ ...noteForm, linkedForumId: id });
    setNoteForm({ title: '', content: '' });
    setShowForm(false);
    fetchForumData();
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this research note?")) return;
    try {
      await api.deleteNote(noteId);
      setNotes(notes.filter(n => n._id !== noteId));
    } catch (err) {
      alert("Failed to delete note.");
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    await api.createSavedPost({ ...postForm, linkedForumId: id });
    setPostForm({ title: '', url: '', note: '' });
    setShowForm(false);
    fetchForumData();
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-generate label from hostname if possible, or just use the type
    let autoLabel = urlForm.type.charAt(0).toUpperCase() + urlForm.type.slice(1);
    try {
      autoLabel = new URL(urlForm.url).hostname;
    } catch (_) {}

    const newUrlEntry = { ...urlForm, label: autoLabel };
    const updatedUrls = [...(forum.urls || []), newUrlEntry];
    
    // If this is the first URL, make it default automatically
    if (!forum.urls || forum.urls.length === 0) {
      updatedUrls[0].isDefault = true;
    }

    try {
      await api.updateForum(id, { urls: updatedUrls });
      setUrlForm({ url: '', label: '', type: 'surface', isDefault: false, isMonitorOnly: false });
      fetchForumData();
    } catch (err) {
      console.error('Failed to add URL:', err);
    }
  };

  const handleSetDefaultUrl = async (index) => {
    const updatedUrls = forum.urls.map((u, idx) => ({
      ...u,
      isDefault: idx === index
    }));
    try {
      await api.updateForum(id, { urls: updatedUrls });
      fetchForumData();
    } catch (err) {
      console.error('Failed to set default URL:', err);
    }
  };

  const handleUpdateForumSetting = async (field, value) => {
    try {
      await api.updateForum(id, { [field]: value });
      fetchForumData();
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }
  };

  const handleRemoveUrl = async (indexToRemove) => {
    const updatedUrls = forum.urls.filter((_, idx) => idx !== indexToRemove);
    try {
      await api.updateForum(id, { urls: updatedUrls });
      fetchForumData();
    } catch (err) {
      console.error('Failed to remove URL:', err);
    }
  };

  const handleRemoveChannel = async (channelId) => {
    try {
      await api.deleteChannel(channelId);
      fetchForumData();
    } catch (err) {
      console.error('Failed to remove channel:', err);
    }
  };

  const runDiagnosis = async () => {
    setRunningDiagnosis(true);
    try {
      await api.diagnosisSync(id);
      const res = await api.getDnsHistory(id);
      setDnsHistory(res.data);
    } catch (err) {
      console.error('Diagnosis sync failed', err);
    } finally {
      setRunningDiagnosis(false);
    }
  };

  const handleForceSync = async () => {
    try {
      await api.forceSyncTelegram(id);
      alert('Force sync initiated. The backend is now polling for missing messages.');
    } catch (err) {
      console.error('Failed to force sync:', err);
      alert('Failed to initiate sync: ' + (err.response?.data?.message || err.message));
    }
  };

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'var(--danger-color)', fontSize: '3rem', marginBottom: '16px' }}>⚠</div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Failed to Load Node</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
        <Link to="/forums" className="btn btn-secondary"><ArrowLeft size={16} /> Back to Forums</Link>
      </div>
    );
  }

  if (!forum) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⟳</div>
          Loading Node Data...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {viewingPost && <SavedPostModal post={viewingPost} onClose={() => setViewingPost(null)} onDelete={handleDeleteSavedPost} />}
      {showAuthModal && (
        <AuthModal
          forum={forum}
          onClose={() => setShowAuthModal(false)}
          onLaunched={(identityName) => {
            setActiveSession(identityName);
            setSessionMsg('');
          }}
        />
      )}

      {showLaunchModal && (
        <LaunchModal
          forum={forum}
          onClose={() => setShowLaunchModal(false)}
          onLaunched={(identityName) => {
            setActiveSession(identityName);
            setSessionMsg('');
          }}
        />
      )}

      {/* Professional Compact Top Bar */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {forum.logoUrl && <img src={forum.logoUrl} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />}
              {forum.name}
              <button 
                onClick={() => setShowInfo(!showInfo)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showInfo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
           </h2>
           
           {/* Compact Tabs in Header */}
           <div className="tabs-container" style={{ margin: 0 }}>
             {[
               { id: 'notes', icon: <FileText size={16} />, label: 'Notes' },
               { id: 'telegram', icon: <Send size={16} />, label: 'Telegram' },
               { id: 'saved', icon: <Bookmark size={16} />, label: 'Saved' },
               { id: 'config', icon: <Settings size={16} />, label: 'Config' },
               { id: 'diagnosis', icon: <Activity size={16} />, label: 'Diagnosis' }
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
                 className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                 style={{ padding: '8px 16px', fontSize: '0.9rem' }}
               >
                 {tab.icon} {tab.label}
               </button>
             ))}
           </div>
        </div>

        {/* Action Buttons on Right */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {activeSession ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--success-color)' }}>
                🟢 <strong>{activeSession}</strong>
              </span>
              <button
                className="btn btn-primary"
                onClick={handleSaveSession}
                disabled={savingSession}
                style={{ background: 'var(--success-color)', padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <Save size={14} /> {savingSession ? 'Saving...' : 'Save Session'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={() => setShowAuthModal(true)} style={{
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
                color: 'var(--accent-color)', fontWeight: 600, padding: '6px 16px', fontSize: '0.9rem'
              }}>
                <ShieldCheck size={16} /> Auth
              </button>
              <button className="btn" onClick={() => setShowLaunchModal(true)} style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: 'var(--success-color)', fontWeight: 600, padding: '6px 16px', fontSize: '0.9rem'
              }}>
                <Play size={16} /> Launch
              </button>
            </div>
          )}
          {['notes', 'saved'].includes(activeTab) && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
              <Plus size={16} /> Add {activeTab === 'notes' ? 'Note' : 'Saved Post'}
            </button>
          )}
        </div>
      </div>

      {/* Info Dropdown Content */}
      {showInfo && (
        <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{forum.description || 'No description provided.'}</p>
           <div className="tag-list">
              {forum.surfaceUrl && <a href={forum.surfaceUrl} target="_blank" rel="noreferrer" className="tag" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>↗ Legacy Surface Web</a>}
              {forum.onionUrl && <span className="tag">🧅 Legacy Onion</span>}
           </div>
        </div>
      )}

      {sessionMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          color: 'var(--success-color)', fontSize: '0.9rem'
        }}>{sessionMsg}</div>
      )}

      {/* Forms Area */}
      {showForm && activeTab === 'notes' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>New Research Note</h3>
          <form onSubmit={handleNoteSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" required className="form-input" value={noteForm.title}
                onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea required className="form-input" rows="5" value={noteForm.content}
                onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save Note</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showForm && activeTab === 'saved' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Save Interesting Post</h3>
          <form onSubmit={handlePostSubmit}>
            <div className="form-group">
              <label className="form-label">Post Title</label>
              <input type="text" required className="form-input" value={postForm.title}
                onChange={e => setPostForm({ ...postForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Post URL</label>
              <input type="text" required className="form-input" value={postForm.url}
                onChange={e => setPostForm({ ...postForm, url: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Context / Research Note</label>
              <input type="text" className="form-input" value={postForm.note}
                onChange={e => setPostForm({ ...postForm, note: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save Post</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Main Tab Content Area */}
      <div className="content-area" style={{ padding: 0, flex: 1, overflowY: 'auto' }}>
        
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notes.length === 0
              ? <div className="empty-state"><FileText size={40} /><h3>No Research Notes</h3><p>Document your findings for this target.</p></div>
              : notes.map(note => (
                <NoteCard 
                  key={note._id} 
                  note={note} 
                  onDelete={handleDeleteNote}
                  onUpdate={(updatedNote) => setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n))}
                  hideContext={true}
                />
              ))}
          </div>
        )}

        {activeTab === 'telegram' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header controls for Telegram Feed */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px' }}>
              <button onClick={handleForceSync} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                <Activity size={14} style={{ marginRight: '6px' }} /> Force Sync Feed
              </button>
            </div>

            {/* Live Message Feed */}
            <div className="card" style={{ background: 'transparent', padding: 0 }}>
              {(() => {
                // Prepare combined feed
                const combinedFeed = [...tgMessages];
                channels.forEach(ch => {
                  if (ch.changeLog && ch.changeLog.length > 0) {
                    ch.changeLog.forEach((log, i) => {
                      combinedFeed.push({
                        _id: `changelog_${ch._id}_${i}`,
                        isBrandingLog: true,
                        channelName: ch.channelName,
                        changeType: log.changeType,
                        oldValue: log.oldValue,
                        newValue: log.newValue,
                        date: log.date,
                      });
                    });
                  }
                });
                
                // Sort by date descending (newest first)
                combinedFeed.sort((a, b) => new Date(b.date) - new Date(a.date));

                if (combinedFeed.length === 0) {
                  return <div className="card"><div className="empty-state"><Send size={40} /><h3>No Telegram Intel</h3><p>Link a Telegram channel in the Config tab to start fetching messages.</p></div></div>;
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {combinedFeed.map(msg => {
                      if (msg.isBrandingLog) {
                        return (
                          <div key={msg._id} className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <AlertTriangle color="#f59e0b" size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{msg.channelName} Branding Update</span>
                              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: 500 }}>
                                {msg.changeType === 'NAME_CHANGE' && (
                                  <div>
                                    Channel Name changed from <span style={{ textDecoration: 'line-through', color: 'var(--danger-color)', margin: '0 4px' }}>{msg.oldValue || 'Unknown'}</span> to <strong style={{ color: 'var(--success-color)' }}>{msg.newValue}</strong>
                                  </div>
                                )}
                                {msg.changeType === 'DESC_CHANGE' && (
                                  <div style={{ marginTop: '4px' }}>
                                    <div style={{ marginBottom: '4px' }}>Channel Description changed:</div>
                                    {msg.oldValue && (
                                      <div style={{ padding: '8px', background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid var(--danger-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', marginBottom: '4px', textDecoration: 'line-through' }}>
                                        {msg.oldValue}
                                      </div>
                                    )}
                                    <div style={{ padding: '8px', background: 'rgba(16,185,129,0.1)', borderLeft: '3px solid var(--success-color)', color: 'var(--text-primary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                      {msg.newValue || '(Description cleared)'}
                                    </div>
                                  </div>
                                )}
                                {msg.changeType === 'PIC_CHANGE' && <div>Channel Profile Picture was updated.</div>}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(msg.date).toLocaleString()}</div>
                          </div>
                        );
                      }

                      return (
                        <div key={msg._id} className="card" style={{ 
                          padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', 
                          background: 'var(--panel-bg)', border: '1px solid rgba(255,255,255,0.06)', 
                          borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : msg.channelId?.channelName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem', display: 'block', marginBottom: '2px' }}>{msg.senderName || msg.channelId?.channelName || 'Unknown'}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{msg.channelId?.channelName}</span>
                              </div>
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>{new Date(msg.date).toLocaleString()}</span>
                          </div>
                          
                          {msg.text && (
                            <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>{msg.text}</p>
                          )}

                          {msg.hasMedia && msg.mediaBase64 && (
                            <div style={{ marginTop: '4px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'inline-block', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>
                              {msg.mediaType === 'photo' ? (
                                <img src={`data:image/jpeg;base64,${msg.mediaBase64}`} alt="Telegram Media" style={{ maxWidth: '100%', maxHeight: '450px', display: 'block' }} />
                              ) : msg.mediaType === 'video' ? (
                                <video src={`data:video/mp4;base64,${msg.mediaBase64}`} controls autoPlay loop muted playsInline style={{ maxWidth: '100%', maxHeight: '450px', display: 'block' }} />
                              ) : (
                                <div style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center' }}>
                                  <a href={`data:application/octet-stream;base64,${msg.mediaBase64}`} download={msg.fileName || `document_${msg.tgMessageId}.bin`} style={{ color: 'var(--accent-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    <div style={{ background: 'rgba(59,130,246,0.15)', padding: '6px', borderRadius: '6px' }}>⬇</div> Download {msg.fileName || msg.mediaType}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {msg.hasMedia && msg.mediaLocalPath && (
                            <div style={{ marginTop: '4px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'inline-block', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>
                              {msg.mediaType === 'video' ? (
                                <video src={`http://localhost:5000/storage/telegram/${msg.mediaLocalPath}`} controls style={{ maxWidth: '100%', maxHeight: '450px', display: 'block' }} />
                              ) : (
                                <div style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center' }}>
                                  <a href={`http://localhost:5000/storage/telegram/${msg.mediaLocalPath}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    <div style={{ background: 'rgba(59,130,246,0.15)', padding: '6px', borderRadius: '6px' }}>⬇</div> Download Large {msg.mediaType}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search intelligence by title or analyst notes..." 
                className="form-input" 
                style={{ paddingLeft: '44px', width: '100%', fontSize: '0.95rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="card-grid">
              {savedPosts.filter(p => 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (p.note && p.note.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0
                ? <div className="empty-state" style={{ gridColumn: '1 / -1' }}><Bookmark size={40} /><h3>No Results Found</h3><p>Try adjusting your search query.</p></div>
                : savedPosts.filter(p => 
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (p.note && p.note.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map(post => (
                <div key={post._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                  
                  {/* Thumbnail */}
                  {post.screenshotBase64 ? (
                    <div style={{ height: '160px', overflow: 'hidden', borderBottom: '1px solid var(--border-color)', background: '#000' }}>
                      <img 
                        src={`data:image/png;base64,${post.screenshotBase64}`} 
                        alt="Thumbnail"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                      />
                    </div>
                  ) : (
                    <div style={{ height: '160px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
                      <Bookmark size={32} color="var(--text-secondary)" opacity={0.5} />
                    </div>
                  )}
                  
                  {/* Card Content */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title}
                    </h3>
                    
                    <a href={post.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <LinkIcon size={12} style={{ flexShrink: 0 }} /> {post.url}
                    </a>

                    {post.note && (
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--text-secondary)', 
                        marginBottom: '12px', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        lineHeight: '1.4'
                      }}>
                        {post.note}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleDeleteSavedPost(post._id)} className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--danger-color)' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => setViewingPost(post)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          <Maximize size={14} /> View intel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="card">
             <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Settings size={18} color="var(--accent-color)"/> General Settings
             </h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
               <div className="form-group">
                 <label className="form-label">Forum Name</label>
                 <input type="text" className="form-input" value={forum.name} onChange={e => handleUpdateForumSetting('name', e.target.value)} />
               </div>
               <div className="form-group">
                 <label className="form-label">Logo URL</label>
                 <input type="text" className="form-input" placeholder="https://..." value={forum.logoUrl || ''} onChange={e => handleUpdateForumSetting('logoUrl', e.target.value)} />
               </div>
               <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                   <input type="checkbox" checked={forum.useTor || false} onChange={e => handleUpdateForumSetting('useTor', e.target.checked)} style={{ width: '18px', height: '18px' }} />
                   <div>
                     <strong style={{ display: 'block' }}>Proxy through Tor (SOCKS5 port 9050)</strong>
                     <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Launch Playwright sessions using a local Tor proxy to protect your IP or access Onion sites.</span>
                   </div>
                 </label>
               </div>
             </div>


             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
               {/* Left Column: URLs */}
               <div>
                 <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Globe size={18} color="var(--accent-color)"/> Target URLs
                 </h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                   Manage known URLs. Click any URL to set it as the default target.
                 </p>
                 <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>URL</label>
                      <input type="text" required className="form-input" placeholder="https://..." value={urlForm.url} onChange={e => setUrlForm({...urlForm, url: e.target.value})} style={{ padding: '8px 12px' }}/>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Type</label>
                        <select className="form-input" value={urlForm.type} onChange={e => setUrlForm({...urlForm, type: e.target.value})} style={{ padding: '8px 12px', height: '37px' }}>
                          <option value="surface">Surface</option>
                          <option value="onion">Onion</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', height: '37px', flex: 1 }}>Add URL</button>
                    </div>
                 </form>

                 <div>
                   {(!forum.urls || forum.urls.length === 0) ? (
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No URLs configured yet.</p>
                   ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {forum.urls.map((u, idx) => (
                         <div key={idx} 
                              onClick={() => handleSetDefaultUrl(idx)}
                              style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', 
                                background: u.isDefault ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)', 
                                borderRadius: '8px', border: `2px solid ${u.isDefault ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                cursor: 'pointer', transition: 'all 0.2s'
                              }}>
                           <div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                               <span style={{ fontWeight: 600, color: u.isDefault ? 'var(--accent-color)' : 'var(--text-primary)' }}>{u.label}</span>
                               <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-primary)' }}>{u.type}</span>
                               {u.isDefault && <span style={{ fontSize: '0.75rem', background: 'var(--accent-color)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>✓ DEFAULT</span>}
                             </div>
                             <a href={u.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textDecoration: 'none' }}>{u.url}</a>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); handleRemoveUrl(idx); }} className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger-color)', border: 'none', background: 'transparent' }}>
                             <X size={20} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>

               {/* Right Column: Telegram */}
               <div>
                 <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Send size={18} color="var(--accent-color)"/> Target Telegram Channels
                 </h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                   Link private Telegram channels associated with this forum for automated MTProto intelligence gathering.
                 </p>

                 <form onSubmit={handleTgSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Channel URL / Invite Link</label>
                      <input type="text" required className="form-input" placeholder="https://t.me/..." value={tgForm.channelUrl} onChange={e => setTgForm({ ...tgForm, channelUrl: e.target.value })} style={{ padding: '8px 12px' }}/>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', height: '37px' }}>Add Channel</button>
                 </form>

                 <div>
                   {(!channels || channels.length === 0) ? (
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No channels monitored yet.</p>
                   ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {channels.map((ch) => (
                         <div key={ch._id} 
                              style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', 
                                background: 'rgba(255,255,255,0.03)', 
                                borderRadius: '8px', border: '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                              }}>
                           <div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                               <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{ch.channelName}</span>
                               <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-primary)' }}>{ch.status}</span>
                             </div>
                             <a href={ch.channelUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{ch.channelUrl}</a>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); handleRemoveChannel(ch._id); }} className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger-color)', border: 'none', background: 'transparent' }}>
                             <X size={20} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
        )}

        {activeTab === 'diagnosis' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--success-color)" /> Domain Health & DNS Monitoring
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Force a manual sync to check all configured URLs for infrastructure changes.</p>
              </div>
              <button className="btn btn-primary" onClick={runDiagnosis} disabled={runningDiagnosis}>
                {runningDiagnosis ? 'Syncing...' : 'Force Sync Now'}
              </button>
            </div>

            {/* Continuous DNS Monitoring History */}
            <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Activity size={18} color="var(--accent-color)" /> Continuous DNS Log (5m interval)
              </h3>
              {(() => {
                if (dnsHistory.length === 0) {
                  return <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No DNS history logs found yet. The background monitor runs every 5 minutes.</p>;
                }

                const grouped = {};
                dnsHistory.forEach(log => {
                  if (!grouped[log.hostname]) grouped[log.hostname] = [];
                  grouped[log.hostname].push(log);
                });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.entries(grouped).map(([hostname, logs]) => {
                      const latest = logs[0];
                      const hasHistory = logs.length > 1;
                      
                      return (
                        <div key={hostname} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--panel-bg)' }}>
                          {/* Current Status Header */}
                          <div style={{ padding: '20px', borderBottom: hasHistory ? '1px solid var(--border-color)' : 'none', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h4 style={{ margin: 0, color: 'var(--accent-color)', fontSize: '1.15rem' }}>{hostname}</h4>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Polled: {new Date(latest.date).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Current A Records</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{latest.records?.a?.length > 0 ? latest.records.a.join(', ') : 'None'}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Current NS Records</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{latest.records?.ns?.length > 0 ? latest.records.ns.join(', ') : 'None'}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* History Dropdown */}
                          {hasHistory && (
                            <div>
                              <button 
                                onClick={() => setOpenHistoryId(openHistoryId === hostname ? null : hostname)}
                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.15)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.85rem', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
                              >
                                {openHistoryId === hostname ? 'Hide History' : `View Change History (${logs.length - 1} previous events)`}
                                {openHistoryId === hostname ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                              
                              {openHistoryId === hostname && (
                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                                  {logs.slice(1).map((hist, idx) => (
                                    <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)' }}>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{new Date(hist.date).toLocaleString()}</div>
                                      <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        {hist.changes.map((c, i) => <li key={i}>{c}</li>)}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForumDetail;

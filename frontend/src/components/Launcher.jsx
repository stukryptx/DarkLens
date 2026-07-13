import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Play, ShieldCheck, User, UserPlus, X, ExternalLink, Globe } from 'lucide-react';

// Combined Auth/Launch Modal for the Launcher
const LauncherModal = ({ forum, onClose }) => {
  const [mode, setMode] = useState('choose'); // 'choose' | 'new'
  const [identities, setIdentities] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getIdentitiesByForum(forum._id).then(r => {
      // Sort so saved sessions are at the top
      const sorted = r.data.sort((a, b) => {
        if (a.sessionStorage && !b.sessionStorage) return -1;
        if (!a.sessionStorage && b.sessionStorage) return 1;
        return 0;
      });
      setIdentities(sorted);
    }).catch(() => {});
  }, [forum._id]);

  // Find default URL, fallback to surfaceUrl or onionUrl
  const defaultUrlEntry = forum.urls?.find(u => u.isDefault);
  const targetUrl = defaultUrlEntry?.url || forum.surfaceUrl || forum.onionUrl || '';

  const handleLaunchSaved = async (identityName) => {
    setLoading(true);
    setError('');
    try {
      await api.openSession({ forumId: forum._id, identityName });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore session.');
      setLoading(false);
    }
  };

  const handleLaunchNew = async (identityName) => {
    if (!targetUrl) {
      setError('This forum has no URL configured. Please go to its config page and set a default URL.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.launchSession({ forumId: forum._id, identityName, url: targetUrl });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to launch browser.');
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
          {forum.logoUrl ? (
            <img src={forum.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <Globe size={28} color="var(--accent-color)" />
          )}
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Launch Identity</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{forum.name}</p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            padding: '12px', borderRadius: '8px', marginBottom: '16px',
            color: 'var(--danger-color)', fontSize: '0.9rem'
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            className={`btn ${mode === 'choose' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }} onClick={() => setMode('choose')}
          >
            <User size={16} /> Choose Existing
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {identities.map(id => (
                  <button
                    key={id._id}
                    onClick={() => id.sessionStorage ? handleLaunchSaved(id.identityName) : handleLaunchNew(id.identityName)}
                    disabled={loading}
                    style={{
                      padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)', borderRadius: '10px',
                      cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
                      transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{id.identityName}</div>
                      <div style={{ fontSize: '0.8rem', color: id.sessionStorage ? 'var(--success-color)' : 'var(--text-secondary)', marginTop: '2px' }}>
                        {id.sessionStorage ? '🔐 Session Saved (Quick Launch)' : '⚠️ Not authenticated (Needs Login)'}
                      </div>
                    </div>
                    {id.sessionStorage ? <Play size={18} color="var(--success-color)" /> : <ExternalLink size={18} color="var(--accent-color)" />}
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
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              disabled={!newName.trim() || loading}
              onClick={() => handleLaunchNew(newName.trim())}
            >
              {loading ? 'Launching...' : <><ShieldCheck size={18} /> Launch Browser & Login</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Launcher = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForum, setSelectedForum] = useState(null);

  useEffect(() => {
    api.getForums().then(res => {
      setForums(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading Launcher...</div>;

  return (
    <div>
      {selectedForum && <LauncherModal forum={selectedForum} onClose={() => setSelectedForum(null)} />}

      <div className="header-actions">
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Play size={28} color="var(--accent-color)" /> Node Orchestrator
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Select a target node below to initialize a secure proxy session.
          </p>
        </div>
      </div>

      <div className="card-grid">
        {forums.map(forum => (
          <div
            key={forum._id}
            onClick={() => setSelectedForum(forum)}
            className="card"
            style={{
              padding: '32px 24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)' }}></div>
            {forum.logoUrl ? (
              <img src={forum.logoUrl} alt={forum.name} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Globe size={32} color="#38bdf8" />
              </div>
            )}
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>{forum.name}</h3>
            <div className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '8px 16px', fontSize: '0.9rem' }}>
              <Play size={16} /> Launch Session
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Launcher;

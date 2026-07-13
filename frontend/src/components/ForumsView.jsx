import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import {
  Plus, Globe, Trash2, Pencil, X, Save,
  ExternalLink, ChevronRight, AlertTriangle, Play
} from 'lucide-react';

// ─── Edit / Delete Confirm Modal ──────────────────────────────────────────────
const ForumModal = ({ mode, forum, onClose, onSaved, onDeleted }) => {
  const [formData, setFormData] = useState(
    mode === 'edit'
      ? { name: forum.name, surfaceUrl: forum.surfaceUrl || '', onionUrl: forum.onionUrl || '', description: forum.description || '' }
      : { name: '', surfaceUrl: '', onionUrl: '', description: '' }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'add') {
        await api.createForum(formData);
      } else {
        await api.updateForum(forum._id, formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save forum.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cascade) => {
    setLoading(true);
    try {
      await api.deleteForum(forum._id, cascade);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete forum.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div className="card" style={{ width: '520px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', background: 'transparent',
          border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px'
        }}>
          <X size={20} />
        </button>

        {mode === 'delete' ? (
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <AlertTriangle size={28} color="var(--danger-color)" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Delete Forum?</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  You are about to delete <strong style={{ color: 'var(--text-primary)' }}>{forum.name}</strong>.
                  Do you want to completely wipe all collected intelligence, or just remove the forum entry?
                </p>
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn" onClick={() => handleDelete(true)} disabled={loading} style={{
                background: 'var(--danger-color)', color: 'white', justifyContent: 'center', padding: '12px',
                boxShadow: '0 4px 12px rgba(239,68,68,0.4)'
              }}>
                <Trash2 size={16} /> {loading ? 'Deleting...' : 'Delete Everything (Cascade Data)'}
              </button>
              
              <button className="btn" onClick={() => handleDelete(false)} disabled={loading} style={{
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', justifyContent: 'center', padding: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Globe size={16} color="var(--text-secondary)"/> {loading ? 'Deleting...' : 'Delete Forum Only (Keep Data)'}
              </button>

              <button className="btn btn-secondary" onClick={onClose} style={{ justifyContent: 'center', padding: '12px', marginTop: '8px' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Globe size={24} color="var(--accent-color)" />
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem' }}>
                {mode === 'add' ? 'Add New Forum Target' : `Edit: ${forum.name}`}
              </h3>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                padding: '12px', borderRadius: '8px', marginBottom: '16px',
                color: 'var(--danger-color)', fontSize: '0.9rem'
              }}>{error}</div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Forum Name *</label>
                <input type="text" required className="form-input"
                  placeholder="e.g. RaidForums, XSS.is"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Surface URL</label>
                <input type="text" className="form-input"
                  placeholder="https://example.com"
                  value={formData.surfaceUrl}
                  onChange={e => setFormData({ ...formData, surfaceUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Onion URL (.onion)</label>
                <input type="text" className="form-input"
                  placeholder="http://example.onion"
                  value={formData.onionUrl}
                  onChange={e => setFormData({ ...formData, onionUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Notes</label>
                <textarea className="form-input" rows="3"
                  placeholder="Forum type, language, known activity..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={16} /> {loading ? 'Saving...' : mode === 'add' ? 'Create Forum' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Launch Saved Session Modal ───────────────────────────────────────────────
const LaunchModal = ({ forum, onClose }) => {
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No saved sessions found. Authenticate first from the Node page.</p>
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

// ─── Main ForumsView ──────────────────────────────────────────────────────────
const ForumsView = () => {
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit'|'delete', forum?: {} }

  useEffect(() => { fetchForums(); }, []);

  const fetchForums = async () => {
    setLoading(true);
    try {
      const res = await api.getForums();
      setForums(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {modal && modal.mode !== 'launch' && (
        <ForumModal
          mode={modal.mode}
          forum={modal.forum}
          onClose={() => setModal(null)}
          onSaved={fetchForums}
          onDeleted={fetchForums}
        />
      )}
      {modal && modal.mode === 'launch' && (
        <LaunchModal forum={modal.forum} onClose={() => setModal(null)} />
      )}

      <div className="header-actions">
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={28} color="var(--accent-color)" /> Target Hub
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {forums.length} forum{forums.length !== 1 ? 's' : ''} monitored
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
          <Plus size={18} /> Add Forum
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading targets...
        </div>
      ) : forums.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '20px' }}>
          <Globe size={56} />
          <h3 style={{ marginBottom: '8px', marginTop: '8px' }}>No Forums Monitored</h3>
          <p style={{ marginBottom: '24px' }}>Add your first intelligence target to begin.</p>
          <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
            <Plus size={16} /> Add First Forum
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {forums.map(forum => (
            <div
              key={forum._id}
              className="card"
              style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              onClick={() => navigate(`/forums/${forum._id}`)}
            >
              {/* Top Accent Line */}
              <div style={{ height: '3px', width: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', position: 'absolute', top: 0, left: 0, boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)' }}></div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px', marginTop: '4px' }}>
                {forum.logoUrl ? (
                  <img src={forum.logoUrl} alt={forum.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <Globe size={24} color="#38bdf8" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{forum.name}</h3>
                    <ChevronRight size={18} color="var(--text-secondary)" />
                  </div>
                  {forum.description && (
                    <p className="card-subtitle" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{forum.description}</p>
                  )}
                </div>
              </div>

              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {forum.surfaceUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Globe size={14} color="#38bdf8" />
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {forum.surfaceUrl}
                    </span>
                  </div>
                )}
                {forum.onionUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', background: 'rgba(245, 158, 11, 0.05)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                    <span style={{ fontSize: '14px' }}>🧅</span>
                    <span style={{ color: '#fcd34d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {forum.onionUrl}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons — stop propagation so card click doesn't fire */}
              <div style={{
                display: 'flex', gap: '8px', marginTop: '20px',
                paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '6px', background: 'rgba(255,255,255,0.02)' }}
                  onClick={(e) => { e.stopPropagation(); setModal({ mode: 'edit', forum }); }}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  className="btn"
                  style={{
                    flex: 1, fontSize: '0.8rem', padding: '6px',
                    background: 'rgba(239,68,68,0.08)', color: 'var(--danger-color)',
                    border: '1px solid rgba(239,68,68,0.2)'
                  }}
                  onClick={(e) => { e.stopPropagation(); setModal({ mode: 'delete', forum }); }}
                >
                  <Trash2 size={14} /> Delete
                </button>
                <button
                  className="btn"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '6px', background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)', border: '1px solid rgba(16,185,129,0.3)' }}
                  onClick={(e) => { e.stopPropagation(); setModal({ mode: 'launch', forum }); }}
                >
                  <Play size={14} /> Launch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumsView;

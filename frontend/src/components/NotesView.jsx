import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Trash2, FileText, Globe, User, Tag, X, Save } from 'lucide-react';
import NoteCard from './NoteCard';

const NotesView = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [forums, setForums] = useState([]);
  const [identities, setIdentities] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    linkedForumId: '',
    linkedIdentityId: '',
    tags: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notesRes, forumsRes, identRes] = await Promise.all([
        api.getNotes(),
        api.getForums(),
        api.getIdentities()
      ]);
      setNotes(notesRes.data);
      setForums(forumsRes.data);
      setIdentities(identRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await api.deleteNote(id);
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const payload = {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        linkedForumId: formData.linkedForumId || undefined,
        linkedIdentityId: formData.linkedIdentityId || undefined
      };
      await api.createNote(payload);
      setModalOpen(false);
      setFormData({ title: '', content: '', linkedForumId: '', linkedIdentityId: '', tags: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="header-actions">
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} color="var(--accent-color)" /> Intelligence Notes
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {notes.length} saved artifact{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Capture Note
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading intel notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '20px' }}>
          <FileText size={56} />
          <h3 style={{ marginBottom: '8px', marginTop: '8px' }}>No Notes Found</h3>
          <p style={{ marginBottom: '24px' }}>Capture your first threat intelligence artifact.</p>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Create Note
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {notes.map(note => (
            <NoteCard 
              key={note._id} 
              note={note} 
              onDelete={handleDelete}
              onUpdate={(updatedNote) => setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n))}
            />
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '600px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
              <X size={20} />
            </button>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={24} color="var(--accent-color)" /> Capture Intel Note
            </h3>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: 'var(--danger-color)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Note Title *</label>
                <input type="text" required className="form-input" placeholder="e.g. Threat Actor Behavior Analysis" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea required className="form-input" rows="6" placeholder="Enter findings, logs, or analysis..." value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Link to Forum (Optional)</label>
                  <select className="form-input" value={formData.linkedForumId} onChange={e => setFormData({ ...formData, linkedForumId: e.target.value })}>
                    <option value="">None</option>
                    {forums.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Link to Identity (Optional)</label>
                  <select className="form-input" value={formData.linkedIdentityId} onChange={e => setFormData({ ...formData, linkedIdentityId: e.target.value })}>
                    <option value="">None</option>
                    {identities.map(i => <option key={i._id} value={i._id}>{i.identityName} ({i.forumId?.name || 'Unknown'})</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input type="text" className="form-input" placeholder="e.g. Ransomware, Phishing, TTP" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Artifact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesView;

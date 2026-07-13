import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trash2, Edit, Save, X, Maximize, Tag, Globe, User } from 'lucide-react';
import { api } from '../api';

const NoteCard = ({ note, onUpdate, onDelete, hideContext = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: note.title, content: note.content });
  const [showFullModal, setShowFullModal] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateNote(note._id, editForm);
      onUpdate(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update note");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          {isEditing ? (
            <input 
              type="text" 
              className="form-input" 
              value={editForm.title} 
              onChange={e => setEditForm({...editForm, title: e.target.value})} 
              style={{ flex: 1, marginRight: '16px', fontSize: '1.25rem', fontWeight: 600, padding: '8px' }}
            />
          ) : (
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{note.title}</h3>
          )}
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isEditing && (
              <button onClick={() => setShowFullModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} title="Read Full">
                <Maximize size={18} />
              </button>
            )}
            <button 
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              title={isEditing ? "Cancel Edit" : "Edit Note"}
            >
              {isEditing ? <X size={18} /> : <Edit size={18} />}
            </button>
            {!isEditing && (
              <button 
                onClick={() => onDelete(note._id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px' }}
                title="Delete Note"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea 
              className="form-input" 
              rows="8" 
              value={editForm.content} 
              onChange={e => setEditForm({...editForm, content: e.target.value})}
              style={{ fontFamily: 'monospace', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px', position: 'relative' }}>
            <div style={{ maxHeight: '180px', overflow: 'hidden', position: 'relative' }} className="markdown-body">
              <ReactMarkdown>{note.content}</ReactMarkdown>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent, var(--panel-bg))', pointerEvents: 'none' }}></div>
            </div>
            
            <button 
              onClick={() => setShowFullModal(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Read full note <Maximize size={12} />
            </button>
          </div>
        )}

        {note.screenshotPath && !isEditing && (
          <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <a href={`http://localhost:5000/storage/screenshots/${note.screenshotPath}`} target="_blank" rel="noreferrer">
              <img src={`http://localhost:5000/storage/screenshots/${note.screenshotPath}`} alt="HUD Screenshot" style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'cover', objectPosition: 'top' }} />
            </a>
          </div>
        )}

        {note.sourceUrl && !isEditing && (
          <div style={{ marginBottom: '16px', wordBreak: 'break-all', background: 'rgba(59, 130, 246, 0.05)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)' }}>
            <a href={note.sourceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14} /> Source Link
            </a>
          </div>
        )}

        {!hideContext && !isEditing && (
          <div style={{ marginTop: 'auto' }}>
            {(note.linkedForumId || note.linkedIdentityId) && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {note.linkedForumId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Globe size={14} color="var(--accent-color)" /> {note.linkedForumId.name || 'Unknown Forum'}
                  </div>
                )}
                {note.linkedIdentityId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <User size={14} color="var(--success-color)" /> {note.linkedIdentityId.identityName || 'Unknown Identity'}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div className="tag-list" style={{ marginTop: 0 }}>
                {note.tags?.map((tag, i) => (
                  <span key={i} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {showFullModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>{note.title}</h2>
              <button onClick={() => setShowFullModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1, color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.7 }} className="markdown-body">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteCard;

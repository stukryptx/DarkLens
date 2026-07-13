import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Users, FileText, Zap, GlobeLock, Play, MessageCircle, Clock, ExternalLink, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({
    forums: [],
    notes: [],
    identities: [],
    telegram: { status: 'Disconnected', isConnected: false }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [forumsRes, notesRes, idRes, tgRes] = await Promise.all([
          api.getForums(),
          api.getNotes(),
          api.getIdentities(),
          api.telegramStatus().catch(() => ({ data: { status: 'Error', isConnected: false } })) // graceful fail
        ]);
        
        setData({
          forums: forumsRes.data || [],
          notes: notesRes.data || [],
          identities: idRes.data || [],
          telegram: tgRes.data || { status: 'Disconnected', isConnected: false }
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Initializing Command Center...</div>;
  }

  // Slice recent data
  const recentNotes = data.notes.slice(0, 4);
  const quickLaunchForums = data.forums.slice(0, 6);

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      <div className="header-actions">
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={28} color="var(--accent-color)" /> Command Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Global session telemetry, quick launch targets, and recent artifacts.
          </p>
        </div>
      </div>

      {/* Top Status Pulse Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Telegram Engine Status */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: data.telegram.isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle color={data.telegram.isConnected ? 'var(--success-color)' : 'var(--danger-color)'} size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Telegram Engine</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div className={`status-dot ${data.telegram.isConnected ? 'active' : ''}`} style={{ background: !data.telegram.isConnected && 'var(--danger-color)' }}></div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.telegram.status}</span>
            </div>
          </div>
        </div>

        {/* DNS Monitor Status */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity color="var(--accent-color)" size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>DNS Monitor</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div className="status-dot" style={{ background: 'var(--accent-color)' }}></div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Active (5m Pulse)</span>
            </div>
          </div>
        </div>

        {/* Identities Status */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users color="#8b5cf6" size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Auth Vault</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.2rem' }}>{data.identities.length}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Identities Synced</span>
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '32px' }}>
        
        {/* Left Column: Quick Launch Targets */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <GlobeLock size={20} color="var(--accent-color)" /> Intelligence Targets
            </h3>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => navigate('/forums')}>View All</button>
          </div>
          
          <div style={{ padding: '0', overflow: 'hidden' }}>
            {quickLaunchForums.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No targets configured.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {quickLaunchForums.map((forum, idx) => (
                  <div key={forum._id} className="card" style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '16px 24px', marginBottom: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/forums/${forum._id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {forum.logoUrl ? (
                        <img src={forum.logoUrl} alt="logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                          {forum.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{forum.name}</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {forum.surfaceUrl && <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Surface</span>}
                          {forum.onionUrl && <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Onion</span>}
                        </div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/launcher`); }}
                    >
                      <Play size={16} /> Launch
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Intel Feed (Notes) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <FileText size={20} color="var(--success-color)" /> Recent Artifacts
            </h3>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => navigate('/notes')}>View All</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentNotes.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent artifacts captured.</div>
            ) : (
              recentNotes.map((note) => (
                <div key={note._id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.4 }}>{note.title}</h4>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Clock size={12} /> {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {note.content}
                  </p>
                  {note.tags && note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {note.tags.map((tag, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

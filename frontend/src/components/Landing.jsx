import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Globe, Play, Lock, ArrowRight, Activity, FileText } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/darklens-logo.png" alt="DarkLens Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>DarkLens</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{ padding: '10px 20px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
          <button className="btn btn-primary" onClick={() => navigate('/signup')} style={{ padding: '10px 24px', borderRadius: '100px' }}>
            Request Access
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' }}>
        
        <div style={{ maxWidth: '800px', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Activity size={16} /> Enterprise Session Manager v1.0
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px' }}>
            Continuous Intelligence & <br/>
            <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Session Monitoring.
            </span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 40px auto' }}>
            DarkLens completely eliminates the friction of managing dozens of isolated sock-puppet accounts. Securely store your identities, inject authenticated sessions directly into Chromium, and monitor the threat landscape seamlessly.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Enter Command Center <ArrowRight size={20} />
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/signup')} style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '8px' }}>
              Create Operator Node
            </button>
          </div>
        </div>

        {/* Banner Graphic */}
        <div style={{ width: '100%', maxWidth: '1000px', marginTop: '20px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="/darklens-banner.png" alt="DarkLens Banner" style={{ width: '100%', display: 'block' }} />
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', width: '100%', marginTop: '60px' }}>
          
          <div className="card" style={{ padding: '32px', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: 600 }}>Frictionless Authentication</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              The platform serializes and securely stores your session state, injecting it directly into a sandboxed browser environment on demand with one click.
            </p>
          </div>

          <div className="card" style={{ padding: '32px', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: 600 }}>In-Browser Capture HUD</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              DarkLens injects a discreet FAB directly into your active Chromium sessions. Instantly update authentication cookies and extract IOCs without leaving the tab.
            </p>
          </div>

          <div className="card" style={{ padding: '32px', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <MessageCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: 600 }}>Native Telegram Engine</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Connect directly to the Telegram network using MTProto (GramJS). Bypass scraping blocks and pull live intelligence from private groups automatically.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
        <p>Strictly for authorized security research and threat intelligence analysis.</p>
        <p style={{ marginTop: '8px' }}>&copy; {new Date().getFullYear()} DarkLens. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Landing;

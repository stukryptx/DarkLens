import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* Left Branding Panel */}
      <div style={{ 
        flex: 1, 
        background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Grid Background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <img src="/darklens-logo.png" alt="DarkLens Logo" style={{ width: '64px', height: '64px', borderRadius: '50%', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }} />
            <h1 style={{ fontSize: '3rem', margin: 0, background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>DarkLens</h1>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2 }}>
            Secure Operator Registration.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Request access to the DarkLens session grid. Centralize your reconnaissance, maintain persistent access, and map threat infrastructures natively.
          </p>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--panel-bg)' }}>
        <div style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '8px' }}>Request Access</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Create a secure operator identity.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger-color)', padding: '16px', borderRadius: '4px', marginBottom: '24px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldAlert size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                placeholder="operator@darklens.net"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  placeholder="••••••••••••"
                />
                <Lock size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
            <button 
              type="submit" 
              style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 600, marginTop: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
              onMouseEnter={(e) => e.target.style.background = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--accent-color)'}
            >
              Register Identity <ArrowRight size={18} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

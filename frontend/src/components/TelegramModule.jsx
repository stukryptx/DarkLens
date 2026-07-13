import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Send, Shield, Smartphone, Key, Lock, CheckCircle, Power, AlertTriangle, MessageCircle } from 'lucide-react';

const TelegramModule = () => {
  const [status, setStatus] = useState('Disconnected'); // Disconnected, PendingCode, Connected
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Credentials form
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [sessionString, setSessionString] = useState('');
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.telegramStatus();
      setStatus(res.data.status);
      if (res.data.phoneNumber) setPhoneNumber(res.data.phoneNumber);
      if (res.data.apiId) setApiId(res.data.apiId);
      if (res.data.sessionString) setSessionString(res.data.sessionString);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api.telegramSendCode({ apiId, apiHash, phoneNumber });
      setMsg(res.data.message);
      setStatus('PendingCode');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api.telegramVerifyCode({ code, password });
      setMsg(res.data.message);
      setSessionString(res.data.sessionString);
      setStatus('Connected');
    } catch (err) {
      if (err.response?.data?.requiresPassword) {
        setRequiresPassword(true);
        setError('Two-Factor Authentication is enabled. Please enter your password.');
      } else {
        setError(err.response?.data?.message || 'Failed to verify code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await api.telegramDisconnect();
      setStatus('Disconnected');
      setMsg('Disconnected successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disconnect.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && status === 'Disconnected' && !phoneNumber) {
    return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading MTProto Status...</div>;
  }

  const maskPhoneNumber = (num) => {
    if (!num) return '';
    return num.substring(0, 3) + '********' + num.substring(num.length - 2);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="header-actions">
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageCircle size={28} color="var(--accent-color)" /> Telegram Integration
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Authenticate a global Telegram account using the MTProto protocol. Once connected, ThreatWire will be able to join private channels, read messages, and scrape intelligence natively.
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '16px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger-color)',
          borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {msg && (
        <div style={{
          padding: '16px', background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)',
          borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <CheckCircle size={20} /> {msg}
        </div>
      )}

      {status === 'Connected' ? (
        <div className="card" style={{ border: '2px solid var(--success-color)', background: 'rgba(16,185,129,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={32} color="var(--success-color)" />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', margin: 0 }}>MTProto Client Active</h3>
              <p style={{ color: 'var(--success-color)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Connected as <span style={{ cursor: 'pointer', background: 'rgba(16,185,129,0.2)', padding: '2px 6px', borderRadius: '4px' }} onClick={() => setShowNumber(!showNumber)}>{showNumber ? phoneNumber : maskPhoneNumber(phoneNumber)}</span>
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
            The MTProto client is running in the background. You can now configure telegram targets inside individual Forum Nodes. The platform will automatically use this authenticated session to read data.
          </p>
          {sessionString && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Active Session String:</div>
              <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)', maxHeight: '60px', overflowY: 'auto' }}>
                {sessionString}
              </div>
            </div>
          )}
          <button className="btn" onClick={handleDisconnect} disabled={loading} style={{
            background: 'rgba(239,68,68,0.1)', color: 'var(--danger-color)', border: '1px solid rgba(239,68,68,0.4)', padding: '10px 20px', fontSize: '1rem'
          }}>
            <Power size={18} /> {loading ? 'Disconnecting...' : 'Terminate Session'}
          </button>
        </div>
      ) : status === 'PendingCode' ? (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Shield size={24} color="#38bdf8" />
            <h3 className="card-title" style={{ margin: 0 }}>Verification Required</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            A 5-digit verification code has been sent to your Telegram app for the number <strong style={{ cursor: 'pointer', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }} onClick={() => setShowNumber(!showNumber)}>{showNumber ? phoneNumber : maskPhoneNumber(phoneNumber)}</strong>.
          </p>
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label className="form-label">Telegram Code</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '40px', letterSpacing: '2px', fontSize: '1.2rem', fontFamily: 'monospace' }}
                  placeholder="12345"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
            </div>
            {requiresPassword && (
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label">2FA Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
                  <input
                    type="password"
                    required
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="Your Telegram Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading || !code} style={{ padding: '12px 24px', fontSize: '1rem' }}>
                {loading ? 'Verifying...' : 'Verify & Connect'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleDisconnect} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Key size={24} color="#38bdf8" />
            <h3 className="card-title" style={{ margin: 0 }}>Configure API Credentials</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            To authenticate reliably, you must provide your Telegram Developer API ID and Hash. You can get these by logging into <a href="https://my.telegram.org" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>my.telegram.org</a>.
          </p>
          <form onSubmit={handleSendCode}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">API ID</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. 1234567"
                  value={apiId}
                  onChange={e => setApiId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">API Hash</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. 0123456789abcdef0123456789abcdef"
                  value={apiHash}
                  onChange={e => setApiHash(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label className="form-label">Phone Number (with country code)</label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !apiId || !apiHash || !phoneNumber} style={{ padding: '12px 24px', fontSize: '1rem', marginTop: '10px' }}>
              <Send size={18} /> {loading ? 'Requesting Code...' : 'Send Verification Code'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TelegramModule;

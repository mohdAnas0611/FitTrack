// app/index.js  ←  Auth / Sign In / Sign Up gate screen connected to Backend API
import { useState } from "react";
import { api } from '../services/api';
import { DEMO_CREDENTIALS, DEFAULT_USER } from '../constants';

export default function AuthScreen({ onLogin }) {
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ name: '', email: '', password: '', username: '' });
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.auth.demo();
      if (res && res.user) {
        onLogin(res.user);
      } else {
        // Local fallback
        onLogin(DEFAULT_USER);
      }
    } catch (e) {
      // Graceful offline fallback
      onLogin(DEFAULT_USER);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setErr('');

    if (mode === 'login') {
      if (!form.email || !form.password) {
        setErr('Please enter both email and password.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.login({
          email: form.email.trim(),
          password: form.password,
        });

        if (res && res.user) {
          onLogin(res.user);
        } else {
          setErr('Login failed. Please check your credentials.');
        }
      } catch (error) {
        // If server is offline and user used demo credentials, allow fallback
        if (form.email === DEMO_CREDENTIALS.email && form.password === DEMO_CREDENTIALS.password) {
          onLogin(DEFAULT_USER);
        } else {
          setErr(error.message || 'Unable to connect to server. Check your credentials.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Sign Up
      if (!form.name || !form.email || !form.password) {
        setErr('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      if (form.password.length < 6) {
        setErr('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          username: form.username ? form.username.trim() : form.email.split('@')[0],
        });

        if (res && res.user) {
          onLogin(res.user);
        } else {
          setErr('Registration failed. Please try again.');
        }
      } catch (error) {
        setErr(error.message || 'Failed to create account. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg,var(--orange),var(--orange-hover))', height: 250, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 35, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', top: 20, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 6 }}>🏃</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font)', letterSpacing: '-0.5px' }}>FitTrack</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontFamily: 'var(--font)', fontWeight: 500 }}>Conquer your city, one step at a time</div>
        </div>
      </div>

      {/* Auth Card */}
      <div style={{ flex: 1, padding: '24px 24px 30px', background: '#fff', borderRadius: '28px 28px 0 0', marginTop: -24, position: 'relative', zIndex: 1, boxShadow: '0 -10px 40px rgba(0,0,0,0.08)', overflowY: 'auto' }}>
        <div className="tab-bar" style={{ marginBottom: 20 }}>
          {['login', 'signup'].map(m => (
            <div key={m} className={`tab-item ${mode === m ? 'active' : ''}`} onClick={() => { setMode(m); setErr(''); }} style={{ textTransform: 'capitalize' }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </div>
          ))}
        </div>

        {mode === 'signup' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', display: 'block', marginBottom: 6 }}>Full Name</label>
            <input
              className="input"
              placeholder="Alex Chen"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', display: 'block', marginBottom: 6 }}>Email Address</label>
          <input
            className="input"
            type="email"
            placeholder="demo@fittrack.app"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', display: 'block', marginBottom: 6 }}>Password</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>

        {err && (
          <div style={{ color: 'var(--red)', background: 'var(--red-light)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14, fontWeight: 600, textAlign: 'center' }}>
            {err}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: 16, padding: '15px' }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In 🚀' : 'Create Account 🎉'}
        </button>

        {/* Demo Fast Login Button */}
        <button
          className="btn"
          style={{ width: '100%', marginTop: 10, padding: '12px', borderRadius: 'var(--r-full)', background: 'var(--orange-light)', color: 'var(--orange)', fontSize: 14, fontWeight: 700 }}
          onClick={handleDemoLogin}
          disabled={loading}
        >
          ⚡ One-Click Demo Mode
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--gray)' }}>
            {mode === 'login' ? 'New to FitTrack? ' : 'Already have an account? '}
            <span
              style={{ color: 'var(--orange)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setErr(''); }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </span>
        </div>

        <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--gray5)', borderRadius: 10, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600 }}>Demo Account: demo@fittrack.app / demo123</span>
        </div>
      </div>
    </div>
  );
}

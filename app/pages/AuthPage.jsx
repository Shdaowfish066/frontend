import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { authService } from '../services';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setIsAuthenticated, setCurrentUser } = useApp();
  const { showSuccess, showError } = useToast();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await authService.login(form.email, form.password);
        setCurrentUser(response);
        setIsAuthenticated(true);
        showSuccess('Welcome back!', 'Good to see you again.');
        navigate('/app');
      } else {
        const response = await authService.register(form.email, form.username, form.password);
        setCurrentUser(response);
        // User is NOT authenticated after register - no token returned
        // They must login separately
        setIsAuthenticated(false);
        showSuccess('Account created!', 'Please login with your credentials.');
        // Stay on auth page, switch to login mode
        setMode('login');
        setForm({ username: '', email: form.email, password: '' });
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#0F1117' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#1A1D27', borderRadius: 20, padding: '36px 32px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 style={{ marginBottom: 28, textAlign: 'center', color: '#F1F5F9' }}>Nebula</h1>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 28 }}>
          {['login', 'register'].map(tab => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              style={{
                flex: 1, background: 'transparent', border: 'none', padding: '10px 0',
                cursor: 'pointer', color: mode === tab ? '#F1F5F9' : '#64748B',
                fontWeight: mode === tab ? 600 : 400, textTransform: 'capitalize',
                borderBottom: mode === tab ? '2px solid #6C63FF' : 'none',
              }}
            >
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              style={{
                padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#F1F5F9', fontSize: 14,
              }}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            style={{
              padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#F1F5F9', fontSize: 14,
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            style={{
              padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#F1F5F9', fontSize: 14,
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, padding: '12px 16px', background: 'linear-gradient(135deg,#6C63FF,#38BDF8)',
              border: 'none', borderRadius: 8, color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}

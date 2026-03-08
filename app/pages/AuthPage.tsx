import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Zap, Chrome, Github } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useApp();
  const { showSuccess } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    showSuccess(
      mode === 'login' ? 'Welcome back!' : 'Account created!',
      mode === 'login' ? 'Good to see you again.' : 'Your account is ready to go.'
    );
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: '#0F1117',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          width: '100%', maxWidth: 420,
          background: '#1A1D27',
          borderRadius: 20,
          padding: '36px 32px',
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.1)',
        }}
      >
        {/* Animated gradient border glow */}
        <motion.div
          animate={{
            background: [
              'linear-gradient(135deg,rgba(108,99,255,0.4),rgba(56,189,248,0.2))',
              'linear-gradient(225deg,rgba(56,189,248,0.4),rgba(108,99,255,0.2))',
              'linear-gradient(315deg,rgba(108,99,255,0.4),rgba(56,189,248,0.2))',
            ],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          style={{
            position: 'absolute', inset: -1, borderRadius: 21,
            zIndex: -1, filter: 'blur(2px)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#6C63FF,#38BDF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(108,99,255,0.5)',
          }}>
            <Zap size={20} color="white" fill="white" />
          </div>
          <span style={{ color: '#F1F5F9', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>Nebula</span>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 28,
        }}>
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                padding: '10px 0', cursor: 'pointer',
                color: mode === tab ? '#F1F5F9' : '#64748B',
                fontWeight: mode === tab ? 600 : 400,
                fontSize: 14, textTransform: 'capitalize', position: 'relative',
              }}
            >
              {tab === 'login' ? 'Sign In' : 'Create Account'}
              {mode === tab && (
                <motion.div
                  layoutId="auth-tab-indicator"
                  style={{
                    position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg,#6C63FF,#38BDF8)', borderRadius: 2,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="username"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FloatingInput
                  label="Username" type="text" value={form.username}
                  onChange={v => setForm(p => ({ ...p, username: v }))}
                  focused={focused === 'username'}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <FloatingInput
            label="Email address" type="email" value={form.email}
            onChange={v => setForm(p => ({ ...p, email: v }))}
            focused={focused === 'email'}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
          />

          <FloatingInput
            label="Password" type={showPass ? 'text' : 'password'} value={form.password}
            onChange={v => setForm(p => ({ ...p, password: v }))}
            focused={focused === 'password'}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            suffix={
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0, display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            style={{
              width: '100%', background: 'linear-gradient(135deg,#6C63FF,#5B53F5)',
              border: 'none', borderRadius: 8, padding: '13px',
              color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(108,99,255,0.5)',
              marginTop: 4,
            }}
          >
            {mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </motion.button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#475569', fontSize: 12 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { icon: <Chrome size={16} />, label: 'Google' },
            { icon: <Github size={16} />, label: 'GitHub' },
          ].map(({ icon, label }) => (
            <button
              key={label}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '10px', color: '#94A3B8', cursor: 'pointer', fontSize: 13,
                fontWeight: 500, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).closest('button')!.style.borderColor = 'rgba(255,255,255,0.2)'; (e.target as HTMLElement).closest('button')!.style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).closest('button')!.style.borderColor = 'rgba(255,255,255,0.1)'; (e.target as HTMLElement).closest('button')!.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 20 }}>
          By continuing, you agree to our{' '}
          <span style={{ color: '#6C63FF', cursor: 'pointer' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: '#6C63FF', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}

function FloatingInput({
  label, type, value, onChange, focused, onFocus, onBlur, suffix,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void;
  focused: boolean; onFocus: () => void; onBlur: () => void;
  suffix?: React.ReactNode;
}) {
  const hasValue = value.length > 0;
  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        position: 'absolute', left: 14, top: focused || hasValue ? 6 : '50%',
        transform: focused || hasValue ? 'none' : 'translateY(-50%)',
        fontSize: focused || hasValue ? 11 : 14,
        color: focused ? '#6C63FF' : '#64748B',
        transition: 'all 0.15s',
        pointerEvents: 'none', zIndex: 1,
        fontWeight: focused || hasValue ? 600 : 400,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: '100%', paddingTop: hasValue || focused ? 20 : 14,
          paddingBottom: 12, paddingLeft: 14,
          paddingRight: suffix ? 40 : 14,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 8, color: '#F1F5F9', outline: 'none',
          boxSizing: 'border-box', fontSize: 14,
          boxShadow: focused ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
          transition: 'all 0.2s',
        }}
      />
      {suffix && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

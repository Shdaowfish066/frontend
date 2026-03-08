import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Users, MessageCircle, Flag, User, LogOut,
  Zap, ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/communities', icon: Users, label: 'Communities' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/reports', icon: Flag, label: 'Reports' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, setIsAuthenticated } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/auth');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: '#111318',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6C63FF,#38BDF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 0 20px rgba(108,99,255,0.4)',
        }}>
          <Zap size={18} color="white" fill="white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>Nebula</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
                  background: isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
                  color: isActive ? '#6C63FF' : '#64748B',
                  textDecoration: 'none',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: 3, background: '#6C63FF',
                    }}
                  />
                )}
                <Icon size={18} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap' }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
          <img
            src={currentUser.avatar}
            alt="avatar"
            style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #6C63FF', flexShrink: 0 }}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{currentUser.username}</p>
                <p style={{ color: '#64748B', fontSize: 11, whiteSpace: 'nowrap', marginTop: 1 }}>Online</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ x: 2 }}
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', width: '100%',
            borderRadius: 10, cursor: 'pointer', background: 'transparent', border: 'none',
            color: '#64748B', textAlign: 'left',
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 14, whiteSpace: 'nowrap' }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '8px', marginTop: 4,
            background: 'rgba(255,255,255,0.04)', border: 'none',
            borderRadius: 8, cursor: 'pointer', color: '#64748B',
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}

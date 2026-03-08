import React from 'react';
import { NavLink } from 'react-router';
import { Home, Users, MessageCircle, User } from 'lucide-react';

const TABS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/communities', icon: Users, label: 'Communities' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#111318', borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'} style={{ flex: 1 }}>
          {({ isActive }) => (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 0', gap: 4,
              color: isActive ? '#6C63FF' : '#64748B',
            }}>
              <Icon size={22} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

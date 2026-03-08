import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ToastSystem } from '../toasts/ToastSystem';

export function RootLayout() {
  const location = useLocation();
  const isAuth = location.pathname === '/auth';

  if (isAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F1117' }}>
        <Outlet />
        <ToastSystem />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F1117' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      <ToastSystem />
    </div>
  );
}
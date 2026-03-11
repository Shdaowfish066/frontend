import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useApp } from '../../store/AppContext';
import { authService } from '../../services';

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setCurrentUser } = useApp();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };

  const navLinkStyle = (path) => ({
    color: location.pathname === path ? '#F1F5F9' : '#94A3B8',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? 600 : 400,
  });

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0F1117' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <nav style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#1A1D27' }}>
          <div style={{ display: 'flex', gap: '24px', maxWidth: '1200px', margin: '0 auto', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                <Link to="/app" style={navLinkStyle('/app')}>Nebula</Link>
                <Link to="/app/messages" style={navLinkStyle('/app/messages')}>Messages</Link>
                <Link to="/app/communities" style={navLinkStyle('/app/communities')}>Communities</Link>
                <Link to="/app/reports" style={navLinkStyle('/app/reports')}>Reports</Link>
                <Link to="/app/profile" style={navLinkStyle('/app/profile')}>Profile</Link>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#EF4444',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Log Out
            </button>
          </div>
        </nav>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

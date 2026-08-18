
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, Search, Bell, Hexagon } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string | undefined, username: string | undefined) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (username) return username.substring(0, 2).toUpperCase();
    return 'AD';
  };

  return (
    <div className="layout-container">
      {/* Left Sidebar */}
      <aside className="left-sidebar">
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} 
            onClick={() => navigate('/')}
          >
            <Hexagon size={18} />
            <span>Dashboard</span>
          </div>
          
          {currentUser?.role === 'ADMIN' && (
            <div 
              className={`nav-item ${location.pathname.startsWith('/admin/users') ? 'active' : ''}`} 
              onClick={() => navigate('/admin/users')}
            >
              <Users size={18} />
              <span>Users</span>
            </div>
          )}
        </nav>
        
        <div className="sidebar-bottom">
          <div className="user-info-section">
            <div className="user-details">
              <span className="user-name">{currentUser?.full_name || currentUser?.username || 'Admin User'}</span>
              <span className="user-email">{currentUser?.email || 'admin@altrium.io'}</span>
            </div>
            <button className="signout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        {/* Top Bar */}
        <header className="topbar">
          <div className="breadcrumb">
            Admin / <strong>{location.pathname.startsWith('/admin/users') ? 'Users' : 'Dashboard'}</strong>
          </div>
          
          <div className="topbar-right">
            <button className="icon-btn" title="Search">
              <Search size={18} />
            </button>
            <button className="icon-btn" title="Notifications">
              <Bell size={18} />
              <span className="notification-dot"></span>
            </button>
            <div className="user-avatar" title="Profile">
              {getInitials(currentUser?.full_name, currentUser?.username)}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

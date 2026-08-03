import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Settings, User, LogOut, X, Users, LayoutDashboard, Briefcase, FileText } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close profile popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="layout-container">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo" onClick={() => navigate('/')}>
            Close-Scale
          </div>
        </div>
        
        <div className="topbar-right">
          <div className="profile-container" ref={profileRef}>
            <button 
              className={`icon-btn ${isProfileOpen ? 'active' : ''}`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title="Profile"
            >
              <User size={20} />
            </button>
            
            {isProfileOpen && (
              <div className="profile-popup glass-effect">
                <div className="profile-info">
                  <strong>{currentUser?.full_name || currentUser?.username || 'User'}</strong>
                  <span className="profile-role">{currentUser?.role?.replace('_', ' ')}</span>
                </div>
                <hr className="divider" />
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
          
          <button 
            className="icon-btn" 
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <Settings size={20} />
          </button>
          
          <button 
            className={`icon-btn ${isSidebarOpen ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="main-wrapper">
        {/* Main Content Area */}
        <main className={`content-area ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
        </main>

        {/* Right Sidebar (Navbar) */}
        <aside className={`right-sidebar glass-effect ${isSidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <div className="nav-item" onClick={() => { navigate('/'); setIsSidebarOpen(false); }}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
            <div className="nav-item" onClick={() => { navigate('/leads'); setIsSidebarOpen(false); }}>
              <Users size={18} />
              <span>Leads</span>
            </div>
            <div className="nav-item" onClick={() => { navigate('/deals'); setIsSidebarOpen(false); }}>
              <Briefcase size={18} />
              <span>Deals</span>
            </div>
            <div className="nav-item" onClick={() => { navigate('/projects'); setIsSidebarOpen(false); }}>
              <FileText size={18} />
              <span>Projects</span>
            </div>
            {currentUser?.role === 'ADMIN' && (
              <div className="nav-item" onClick={() => { navigate('/admin/users'); setIsSidebarOpen(false); }}>
                <Users size={18} />
                <span>Manage Users</span>
              </div>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}

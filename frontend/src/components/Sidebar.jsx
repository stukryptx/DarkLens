import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GlobeLock, FileText, Send, Play, LogOut, Crosshair, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const links = [
    { path: '/', label: 'Command Center', icon: <LayoutDashboard size={20} color="#ededed" /> },
    { path: '/forums', label: 'Targets & Hubs', icon: <GlobeLock size={20} color="#3b82f6" /> },
    { path: '/launcher', label: 'Launch Node', icon: <Play size={20} color="#10b981" /> },
    { path: '/notes', label: 'Intel Notes', icon: <FileText size={20} color="#f59e0b" /> },
    { path: '/channels', label: 'Telegram Intercept', icon: <Send size={20} color="#8b5cf6" /> },
    { path: '/about', label: 'About & Support', icon: <Info size={20} color="#ec4899" /> },
  ];

  return (
    <div style={{
      width: isCollapsed ? '64px' : '260px',
      height: '100vh',
      background: 'var(--panel-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      transition: 'width 0.3s ease',
      position: 'relative'
    }}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: '50%',
          right: '-12px',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: 'var(--accent-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          padding: 0
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div style={{ 
        padding: isCollapsed ? '32px 0' : '32px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '16px'
      }}>
        <img src="/darklens-logo.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '50%', boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)' }} />
        {!isCollapsed && (
          <h1 style={{ 
            fontSize: '1.4rem', 
            margin: 0, 
            background: 'linear-gradient(90deg, #38bdf8, #818cf8)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>DarkLens</h1>
        )}
      </div>

      <nav style={{ flex: 1, padding: isCollapsed ? '0 8px' : '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-secondary)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          padding: isCollapsed ? '16px 0 8px 0' : '16px 12px 8px 12px', 
          fontWeight: 600,
          textAlign: isCollapsed ? 'center' : 'left',
          opacity: isCollapsed ? 0 : 1,
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          height: isCollapsed ? '0px' : 'auto'
        }}>
          {!isCollapsed && 'Modules'}
        </div>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              padding: isCollapsed ? '12px 0' : '12px 16px',
              textDecoration: 'none',
              borderRadius: '8px',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))' : 'transparent',
              borderLeft: isActive && !isCollapsed ? '3px solid var(--accent-color)' : '3px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? 600 : 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            })}
            title={isCollapsed ? link.label : ''}
            className="sidebar-link"
          >
            <div style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>{link.icon}</div>
            {!isCollapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: isCollapsed ? '24px 8px' : '24px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={logout}
          title={isCollapsed ? "Disconnect" : ""}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? '0' : '12px',
            padding: isCollapsed ? '12px 0' : '12px 16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--danger-color)',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Disconnect</span>}
        </button>
      </div>

      <style>{`
        .sidebar-link:hover:not(.active) {
          background: rgba(255, 255, 255, 0.03) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

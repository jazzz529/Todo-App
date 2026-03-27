import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Plus, CheckCircle2, Sun, Moon } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [initial, setInitial] = useState('');

  useEffect(() => {
    async function fetchInitial() {
      if (!currentUser) return;
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        const name = snap.exists() ? snap.data().name : '';
        setInitial((name || currentUser.email || '?').charAt(0).toUpperCase());
      } catch {
        setInitial((currentUser.email || '?').charAt(0).toUpperCase());
      }
    }
    fetchInitial();
  }, [currentUser]);

  const handleNewTodo = () => {
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('open-add-todo'));
    } else {
      navigate('/');
      // Small delay to ensure Dashboard is mounted before dispatching
      setTimeout(() => window.dispatchEvent(new CustomEvent('open-add-todo')), 150);
    }
  };

  const iconBtnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px',
    border: 'none', background: 'transparent', cursor: 'pointer',
    color: 'var(--text-secondary)', borderRadius: '50%',
    transition: 'color 0.2s, background 0.2s',
    flexShrink: 0
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.8rem 2.5rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{
          backgroundColor: 'var(--accent-primary)', color: 'white',
          width: '32px', height: '32px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(129, 140, 248, 0.4)'
        }}>
          <CheckCircle2 size={20} />
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'Roboto, sans-serif' }}>TodoApp</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'var(--surface-card)', padding: '0.2rem 0.5rem', borderRadius: '1rem', border: 'var(--glass-border)', color: 'var(--text-secondary)', marginLeft: '0.2rem' }}>v3.0.0</span>
      </div>

      {/* Right icons — all equal 36×36 */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button onClick={handleNewTodo} style={iconBtnStyle} title="New Todo"
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(129,140,248,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
          <Plus size={20} />
        </button>

        <button onClick={toggleTheme} style={iconBtnStyle} title="Toggle Theme"
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(129,140,248,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Avatar circle */}
        <div
          onClick={() => navigate('/profile')}
          title="Profile"
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(129, 140, 248, 0.35)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
            userSelect: 'none', flexShrink: 0
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(129,140,248,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(129,140,248,0.35)'; }}
        >
          {initial}
        </div>

        <button onClick={logout} style={{ ...iconBtnStyle, color: 'var(--accent-danger)' }} title="Logout"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,81,73,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

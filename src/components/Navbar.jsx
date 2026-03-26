import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, LogOut, Plus } from 'lucide-react';

const Navbar = () => {
  const { logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass" style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem',
      margin: '1rem 2rem',
      borderRadius: '1rem',
      position: 'sticky',
      top: '1rem',
      zIndex: 50
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontSize: '1.25rem', fontWeight: 600 }}>
        TodoApp
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-add-todo'))} className="btn btn-ghost" title="Create New Todo">
          <Plus size={20} />
        </button>

        <button onClick={toggleTheme} className="btn btn-ghost" aria-label="Toggle theme" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <Link to="/profile" className="btn btn-ghost" title="Profile">
          <User size={20} />
        </Link>
        
        <button onClick={logout} className="btn btn-ghost" style={{ color: 'var(--accent-danger)' }} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch {
      setError('Failed to log in');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem' }}>Log In</h2>
        {error && <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" ref={emailRef} required className="input" placeholder="Enter your email" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" ref={passwordRef} required className="input" placeholder="Enter your password" />
          </div>
          <button disabled={loading} className="btn btn-primary" type="submit" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Need an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(107, 114, 128, 0.6)', fontWeight: 500 }}>
          v1.0.0
        </div>
      </div>
    </div>
  );
}

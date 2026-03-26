import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value, nameRef.current.value);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to create an account');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem' }}>Sign Up</h2>
        {error && <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Name</label>
            <input type="text" ref={nameRef} required className="input" placeholder="Your name" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" ref={emailRef} required className="input" placeholder="Your email" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" ref={passwordRef} required className="input" placeholder="Create a password" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
            <input type="password" ref={passwordConfirmRef} required className="input" placeholder="Confirm password" />
          </div>
          <button disabled={loading} className="btn btn-primary" type="submit" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}

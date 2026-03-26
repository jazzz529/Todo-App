import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Profile() {
  const { currentUser, changePassword } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile((prev) => ({ ...prev, email: currentUser.email }));
        }
      } catch (err) {
        console.error("Firestore user fetch error:", err);
      }
    }
    fetchProfile();
  }, [currentUser]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await changePassword(newPassword);
      setMessage('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Security check: You must log out and log back in before changing your password.');
      } else {
        setError(`Failed to update password: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    if (profile.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>My Profile</h1>
      
      {error && <div style={{ color: 'white', backgroundColor: 'var(--accent-danger)', padding: '1rem', borderRadius: '0.8rem' }}>{error}</div>}
      {message && <div style={{ color: 'white', backgroundColor: 'var(--accent-success)', padding: '1rem', borderRadius: '0.8rem' }}>{message}</div>}

      <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            backgroundColor: 'var(--accent-primary)', color: 'white', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '4rem', fontWeight: 600, boxShadow: 'var(--shadow-md)'
          }}>
            {getInitial()}
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>{profile.name || 'User'}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Change Password</h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="input"
            required
            minLength={6}
          />
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

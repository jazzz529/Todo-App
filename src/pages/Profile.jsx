import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, Save, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Profile() {
  const { currentUser, changePassword } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ ...docSnap.data(), email: currentUser.email });
          setEditNameValue(docSnap.data().name || '');
        } else {
          setProfile({ name: '', email: currentUser.email });
          setEditNameValue('');
        }
      } catch (err) {
        console.error("Firestore user fetch error:", err);
        setError("Error fetching profile from database. This is usually caused by missing Firestore Security Rules for the 'users' collection. " + err.message);
      } finally {
        setLoadingProfile(false);
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

  const handleUpdateName = async () => {
    if (!editNameValue.trim()) return;
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, { name: editNameValue.trim() }, { merge: true });
      
      setProfile(prev => ({ ...prev, name: editNameValue.trim() }));
      setMessage('Name updated successfully!');
      setIsEditingName(false);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (err) {
      console.error(err);
      setError('Failed to update name: ' + err.message);
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

  if (loadingProfile) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 500, opacity: 0.7 }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <h1 style={{ margin: 0, paddingBottom: '0.5rem' }}>My Profile</h1>
      
      {error && (
        <div className="animate-fade-in" style={{ 
          position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'var(--accent-danger)', color: 'white', 
          padding: '1rem 1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)',
          zIndex: 9999, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.8rem',
          maxWidth: '90%'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      
      {message && createPortal(
        <div className="animate-fade-in" style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
            padding: '3rem 2rem', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            textAlign: 'center', minWidth: '320px', maxWidth: '90%'
          }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-success)',
              marginBottom: '0.5rem'
            }}>
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>Success</h2>
            <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{message}</p>
          </div>
        </div>,
        document.body
      )}

      <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', 
            backgroundColor: 'var(--accent-primary)', color: 'white', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 600, boxShadow: 'var(--shadow-md)'
          }}>
            {getInitial()}
          </div>
        </div>
        
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '300px' }}>
          {isEditingName ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center', alignItems: 'center' }}>
              <input 
                type="text" 
                value={editNameValue} 
                onChange={(e) => setEditNameValue(e.target.value)} 
                className="input" 
                autoFocus
                placeholder="Enter Full Name"
                style={{ padding: '0.6rem', textAlign: 'center', width: '180px', fontSize: '1.2rem', fontWeight: 600 }}
              />
              <button disabled={loading} onClick={handleUpdateName} className="btn btn-primary" style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center' }} title="Save Name">
                <Save size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', lineHeight: 1 }}>{profile.name || 'User'}</h2>
              <button onClick={() => setIsEditingName(true)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.2rem', display: 'flex', alignItems: 'center' }} title="Edit Name">
                <Edit2 size={16} />
              </button>
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>{profile.email}</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', marginTop: 0 }}>Change Password</h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="input"
              required
              minLength={6}
              style={{ width: '100%', paddingRight: '2.5rem' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '0.8rem', top: '0.8rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

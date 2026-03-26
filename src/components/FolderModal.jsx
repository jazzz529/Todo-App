import React, { useState } from 'react';

export default function FolderModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#202124'); // Dark mode Keep aesthetic by default

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, color });
    setName('');
    setColor('#202124');
  };

  const getTextColor = (hexcolor) => {
    if (!hexcolor || hexcolor.length !== 7) return '#ffffff';
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1e1e24' : '#ffffff';
  };

  const textColor = getTextColor(color);
  const subtleColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
    }} onClick={onClose}>

      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: '400px', margin: '2rem', padding: '1rem',
        backgroundColor: color, color: textColor, borderRadius: '0.6rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)', transition: 'background-color 0.3s ease',
        border: `1px solid ${subtleColor}`
      }}>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder Name"
            autoFocus
            style={{
              width: '100%', fontSize: '1.3rem', fontWeight: 500,
              background: 'transparent', border: 'none', outline: 'none',
              color: textColor, padding: '0.5rem'
            }}
          />

          <div style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: subtleColor, fontWeight: 500 }}>Folder Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '36px', height: '36px', padding: '0',
                border: `2px solid ${subtleColor}`, borderRadius: '50%', cursor: 'pointer', background: 'transparent'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: subtleColor, fontWeight: 600, fontSize: '0.95rem',
              padding: '0.5rem 1rem'
            }}>
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: textColor, fontWeight: 600, fontSize: '0.95rem',
              padding: '0.5rem 1rem', opacity: name.trim() ? 1 : 0.5
            }}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

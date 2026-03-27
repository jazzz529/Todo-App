import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, ChevronDown, ChevronRight } from 'lucide-react';

export default function TodoModal({ isOpen, onClose, onSave, initialData }) {
  const [heading, setHeading] = useState('');
  const [items, setItems] = useState([{ text: '', done: false }]);
  const [color, setColor] = useState(''); // Default to empty string (Theme matched)
  const [showTicked, setShowTicked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setHeading(initialData.heading || '');
        setItems(initialData.items && initialData.items.length > 0 ? initialData.items : [{ text: '', done: false }]);
        setColor(initialData.color || '');
      } else {
        setHeading('');
        setItems([{ text: '', done: false }]);
        setColor('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddItem = () => setItems([...items, { text: '', done: false }]);
  
  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index].text = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSave = () => {
    if (!heading.trim() || items.every(i => !i.text.trim())) return;
    const validItems = items.filter(i => i.text.trim() !== '');
    
    const payload = { heading, items: validItems, color };
    if (initialData && initialData.id) {
      payload.id = initialData.id;
    }
    
    onSave(payload);
    onClose();
  };

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div className="glass animate-fade-in" style={{
        width: '100%', maxWidth: '500px', 
        backgroundColor: 'var(--surface-card)',
        borderRadius: '1.5rem',
        border: 'var(--glass-border)',
        display: 'flex', flexDirection: 'column', 
        maxHeight: '85vh',
        color: 'var(--text-primary)',
        overflow: 'hidden' // Root container doesn't scroll
      }}>
        {/* Header - Fixed */}
        <div style={{ padding: '1.5rem 2rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-card)', border: 'none' }}>
          <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', opacity: 0.8 }}>{initialData ? 'Edit Todo' : 'New Todo'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0.25 }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ padding: '0 2rem 1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <input 
              type="text" value={heading} onChange={(e) => setHeading(e.target.value)} 
              placeholder="Todo Title" 
              style={{ 
                width: '100%', fontSize: '2rem', fontWeight: 700, 
                backgroundColor: 'transparent', color: 'var(--text-primary)', 
                border: 'none', padding: 0, outline: 'none', boxShadow: 'none',
                letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif"
              }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Active Items */}
            {items.map((item, idx) => {
              if (item.done) return null;
              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
                  <div 
                    onClick={() => {
                      const newItems = [...items];
                      newItems[idx].done = !newItems[idx].done;
                      setItems(newItems);
                    }}
                    style={{ 
                      width: '20px', height: '20px', borderRadius: '50%', 
                      border: item.done ? 'none' : `2px solid ${color || 'var(--border-color)'}`,
                      backgroundColor: item.done ? (color || 'var(--accent-primary)') : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {item.done && <Check size={12} color="white" strokeWidth={4} />}
                  </div>
                  <input 
                    type="text" value={item.text} 
                    onChange={(e) => handleItemChange(idx, e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    autoFocus={idx === items.length - 1 && items.length > 1 && item.text === ''}
                    placeholder={`Todo ${idx + 1}`} 
                    style={{ 
                      flex: 1, backgroundColor: 'transparent', color: 'var(--text-primary)', 
                      border: 'none', padding: 0, outline: 'none', boxShadow: 'none', 
                      fontSize: '1.1rem', fontWeight: 500,
                      textDecoration: item.done ? 'line-through' : 'none',
                      opacity: item.done ? 0.3 : 1
                    }}
                  />
                  <button onClick={() => handleRemoveItem(idx)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.2rem', opacity: 0.2 }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}

            {/* Persistent Add Item Button */}
            <button 
              onClick={handleAddItem}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.8rem', 
                marginTop: '0.5rem', cursor: 'pointer', 
                color: 'var(--text-secondary)', opacity: 0.6,
                background: 'none', border: 'none', padding: '0.5rem 0',
                fontSize: '0.9rem', fontWeight: 500, transition: 'opacity 0.2s'
              }}
              className="btn-ghost-no-border"
            >
              <Plus size={16} />
              Add todo
            </button>

            {/* Ticked Section Toggle */}
            {items.some(i => i.done) && (
              <div 
                onClick={() => setShowTicked(!showTicked)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.8rem', 
                  marginTop: '1rem', cursor: 'pointer', 
                  color: 'var(--accent-primary)', opacity: 0.8,
                  fontSize: '0.75rem', fontWeight: 900, textTransform: 'none', letterSpacing: '0.12em'
                }}
              >
                {showTicked ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                + {items.filter(i => i.done).length} ticked ToDos
              </div>
            )}

            {/* Ticked Items (Collapsible) */}
            {showTicked && items.map((item, idx) => {
              if (!item.done) return null;
              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
                  <div 
                    onClick={() => {
                      const newItems = [...items];
                      newItems[idx].done = !newItems[idx].done;
                      setItems(newItems);
                    }}
                    style={{ 
                      width: '20px', height: '20px', borderRadius: '50%', 
                      border: item.done ? 'none' : `2px solid ${color || 'var(--border-color)'}`,
                      backgroundColor: item.done ? (color || 'var(--accent-primary)') : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {item.done && <Check size={12} color="white" strokeWidth={4} />}
                  </div>
                  <input 
                    type="text" value={item.text} 
                    onChange={(e) => handleItemChange(idx, e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    placeholder={`Todo ${idx + 1}`} 
                    style={{ 
                      flex: 1, backgroundColor: 'transparent', color: 'var(--text-primary)', 
                      border: 'none', padding: 0, outline: 'none', boxShadow: 'none', 
                      fontSize: '1.1rem', fontWeight: 500,
                      textDecoration: item.done ? 'line-through' : 'none',
                      opacity: item.done ? 0.3 : 1
                    }}
                  />
                  <button onClick={() => handleRemoveItem(idx)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.2rem', opacity: 0.2 }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-card)', border: 'none', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</div>
            <input 
              type="color" 
              value={color || '#818cf8'}
              onChange={(e) => setColor(e.target.value)}
              className="color-picker"
              title="Card Accent Color"
            />
            {color && (
              <button
                onClick={() => setColor('')}
                title="Remove color"
                style={{
                  background: 'none', border: '1px solid var(--border-color)',
                  borderRadius: '6px', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.72rem',
                  fontWeight: 700, padding: '0.3rem 0.6rem',
                  letterSpacing: '0.04em', transition: 'all 0.2s'
                }}
              >
                ✕ Remove
              </button>
            )}
          </div>

          <button onClick={handleSave} className="btn-primary" style={{ 
            backgroundColor: 'var(--accent-primary)',
            borderRadius: '9999px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(129, 140, 248, 0.4)',
            padding: '1rem 2.5rem',
            color: 'white'
          }}>
            {initialData ? 'Update Todo' : 'Save Todo'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

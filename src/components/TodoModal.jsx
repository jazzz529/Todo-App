import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Circle } from 'lucide-react';

export default function TodoModal({ isOpen, onClose, onSave, initialData }) {
  const [heading, setHeading] = useState('');
  const [items, setItems] = useState([{ text: '', done: false }]);
  const [color, setColor] = useState(''); // Default to empty string (Theme matched)

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
      <div className={color ? "animate-fade-in" : "glass animate-fade-in"} style={{
        width: '100%', maxWidth: '500px', 
        backgroundColor: color || undefined,
        borderRadius: '1.5rem', border: 'none',
        padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
        maxHeight: '90vh', overflowY: 'auto',
        color: color ? '#1e1e24' : 'var(--text-primary)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{initialData ? 'Edit Todo List' : 'New Todo List'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit' }}>
            <X size={24} />
          </button>
        </div>

        <div>
          <input 
            type="text" value={heading} onChange={(e) => setHeading(e.target.value)} 
            placeholder="Heading" 
            style={{ 
              width: '100%', fontSize: '1.8rem', fontWeight: 700, 
              backgroundColor: 'transparent', color: 'inherit', 
              border: 'none', padding: '0.5rem 0', outline: 'none', boxShadow: 'none' 
            }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
               <Circle size={18} style={{ opacity: 0.5 }} />
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
                placeholder={`List item`} 
                style={{ 
                  flex: 1, backgroundColor: 'transparent', color: 'inherit', 
                  border: 'none', padding: '0.4rem 0', outline: 'none', boxShadow: 'none', 
                  fontSize: '1.1rem' 
                }}
              />
              <button onClick={() => handleRemoveItem(idx)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', padding: '0.5rem', opacity: 0.7 }}>
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <input 
              type="color" 
              value={color || '#ffffff'}
              onChange={(e) => setColor(e.target.value)}
              className="color-picker"
              title="Card Background Color"
            />
          </div>

          <button onClick={handleSave} className="btn btn-primary" style={{ backgroundColor: '#1e1e24', color: 'white' }}>
            {initialData ? 'Update List' : 'Save List'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

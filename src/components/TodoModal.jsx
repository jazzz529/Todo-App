import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function TodoModal({ isOpen, onClose, onSave, initialData }) {
  const [heading, setHeading] = useState('');
  const [items, setItems] = useState([{ text: '', done: false }]);
  const [color, setColor] = useState('#6366f1'); // Default vibrant indigo

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setHeading(initialData.heading || '');
        setItems(initialData.items && initialData.items.length > 0 ? initialData.items : [{ text: '', done: false }]);
        setColor(initialData.color || '#6366f1');
      } else {
        setHeading('');
        setItems([{ text: '', done: false }]);
        setColor('#6366f1');
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
    
    // Pass the id back if we are editing
    const payload = { heading, items: validItems, color };
    if (initialData && initialData.id) {
      payload.id = initialData.id;
    }
    
    onSave(payload);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem' // Fixed overlap issue
    }}>
      <div className="glass animate-fade-in" style={{
        width: '100%', maxWidth: '500px', backgroundColor: color,
        padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
        maxHeight: '90vh', overflowY: 'auto',
        color: '#1e1e24', // Use dark text inside the color block
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
            placeholder="Heading (e.g., Groceries)" 
            className="input" style={{ width: '100%', fontSize: '1.2rem', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.85)', color: '#000', border: 'none' }} 
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Card Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="color" 
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                WebkitAppearance: 'none', border: 'none', width: '40px', height: '40px',
                borderRadius: '8px', cursor: 'pointer', padding: 0, overflow: 'hidden'
              }}
              title="Pick any color"
            />
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Choose a vibrant color</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <label style={{ fontWeight: 600 }}>Items</label>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" value={item.text} onChange={(e) => handleItemChange(idx, e.target.value)} 
                className="input" placeholder={`Item ${idx + 1}`} 
                style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#000', border: 'none' }}
              />
              <button onClick={() => handleRemoveItem(idx)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(0,0,0,0.6)' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button onClick={handleAddItem} className="btn btn-ghost" style={{ alignSelf: 'flex-start', color: '#1e1e24', fontWeight: 600 }}>
            <Plus size={18} /> Add Item
          </button>
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ marginTop: '1rem', backgroundColor: '#1e1e24', color: 'white' }}>
          {initialData ? 'Update Todo List' : 'Save Todo List'}
        </button>
      </div>
    </div>
  );
}

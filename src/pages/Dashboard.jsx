import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Pencil, CheckCircle2, Circle, Check, Pin } from 'lucide-react';
import { createPortal } from 'react-dom';
import TodoModal from '../components/TodoModal';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Listen for the global Plus button clicked from Navbar
    const handleOpenAdd = () => openNewModal();
    window.addEventListener('open-add-todo', handleOpenAdd);

    if (!currentUser) return;
    
    setErrorMsg('');
    const q = query(
      collection(db, 'todos'), 
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTodos(todosData.sort((a, b) => {
        // Sort by Pinned (true first), then by CreatedAt (descending)
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        return b.createdAt - a.createdAt;
      }));
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setErrorMsg(error.message); // Explicitly display Firebase rules failure
    });

    return () => {
      unsubscribe();
      window.removeEventListener('open-add-todo', handleOpenAdd);
    };
  }, [currentUser]);

  const openNewModal = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleSaveTodo = async (todoData) => {
    try {
      if (todoData.id) {
        // Update existing
        const { id, heading, items, color } = todoData;
        await updateDoc(doc(db, 'todos', id), { heading, items, color });
      } else {
        // Add new
        await addDoc(collection(db, 'todos'), {
          ...todoData,
          userId: currentUser.uid,
          createdAt: Date.now()
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save: " + err.message);
    }
  };

  const togglePin = async (todoId) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      await updateDoc(doc(db, 'todos', todoId), {
        pinned: !todo.pinned
      });
    } catch (err) {
      alert("Failed to pin: " + err.message);
    }
  };

  const toggleItemDone = async (todoId, itemIndex) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      const newItems = [...todo.items];
      newItems[itemIndex].done = !newItems[itemIndex].done;
      
      await updateDoc(doc(db, 'todos', todoId), {
        items: newItems
      });
    } catch (err) {
      alert("Failed to update item: " + err.message);
    }
  };

  const confirmDeleteTodo = async () => {
    if (!todoToDelete) return;
    const idToDelete = todoToDelete.id;
    setTodoToDelete(null); // Optimistically close popup instantly
    try {
      await deleteDoc(doc(db, 'todos', idToDelete));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem', fontFamily: 'Roboto, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: "'Space Grotesk', sans-serif" }}>My Dashboard</h1>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: 'var(--accent-danger)', color: 'white', padding: '1rem', borderRadius: '0.8rem', marginBottom: '2rem' }}>
          <strong>Database Connection Error:</strong> {errorMsg}
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>If you are getting "Missing or insufficient permissions", you need to update your Firestore Security Rules to allow read/writes.</p>
        </div>
      )}

      {!errorMsg && todos.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No Todos yet! Create one to get started.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '1.25rem',
          alignItems: 'start'
        }}>
          {todos.map(todo => {
            const itemsWithIndex = todo.items.map((item, originalIndex) => ({ ...item, originalIndex }));
            const uncheckedItems = itemsWithIndex.filter(i => !i.done);
            const checkedItems = itemsWithIndex.filter(i => i.done);
            
            // Prioritize unchecked, then fill up to 3 items with checked ones for density
            const displayItems = [...uncheckedItems, ...checkedItems].slice(0, 3);
            const remainingCount = todo.items.length - displayItems.length;

            return (
              <div key={todo.id} className="glass animate-fade-in" style={{ 
                backgroundColor: 'var(--surface-card)', 
                color: 'var(--text-primary)', 
                padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border 0.3s ease', 
                cursor: 'default',
                border: 'var(--glass-border)',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {todo.color && (
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, 
                    height: '5px', backgroundColor: todo.color,
                    zIndex: 10
                  }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, wordBreak: 'break-word', flex: 1, letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: "'Space Grotesk', sans-serif" }}>{todo.heading}</h3>
                  <div style={{ display: 'flex', gap: '0.1rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => togglePin(todo.id)} 
                      className={`card-action-btn ${todo.pinned ? 'pinned-active' : ''}`} 
                      style={{ color: 'var(--accent-primary)', opacity: todo.pinned ? 1 : 0.4 }} 
                      title={todo.pinned ? "Unpin Todo" : "Pin Todo"}
                    >
                      <Pin size={15} fill={todo.pinned ? "currentColor" : "none"} style={{ transform: todo.pinned ? 'rotate(0deg)' : 'rotate(-45deg)', transition: 'transform 0.3s ease' }} />
                    </button>
                    <button onClick={() => openEditModal(todo)} className="card-action-btn" style={{ color: 'var(--accent-primary)' }} title="Edit Todo">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setTodoToDelete(todo)} className="card-action-btn" style={{ color: 'var(--accent-primary)' }} title="Delete Todo">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {displayItems.map((item) => (
                    <div key={item.originalIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => toggleItemDone(todo.id, item.originalIndex)}>
                      <div
                        className={item.done ? 'tick-pop' : ''}
                        style={{ 
                          width: '18px', height: '18px', borderRadius: '50%', 
                          border: item.done ? 'none' : `2px solid var(--accent-primary)`,
                          backgroundColor: item.done ? 'var(--accent-primary)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                      >
                        {item.done && <Check size={10} color="white" strokeWidth={4} />}
                      </div>
                      <span style={{ 
                        textDecoration: item.done ? 'line-through' : 'none', 
                        opacity: item.done ? 0.5 : 1, /* Increased contrast */
                        wordBreak: 'break-word',
                        flex: 1,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: item.done ? 'var(--text-disabled)' : 'inherit'
                      }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      + {remainingCount}
                    </div>
                  )}
                </div>

                {checkedItems.length > 0 && (
                  <div style={{ 
                    marginTop: 'auto', 
                    paddingTop: '0.8rem', 
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary)',
                    fontWeight: 900,
                    textTransform: 'none',
                    letterSpacing: '0.12em',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    +{checkedItems.length} ticked ToDos
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TodoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTodo} initialData={editingTodo} />
      
      {todoToDelete && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass animate-fade-in" style={{
            width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-secondary)',
            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            borderRadius: '1.5rem', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Delete List?</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete "{todoToDelete.heading}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button onClick={() => setTodoToDelete(null)} className="btn btn-ghost" style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button onClick={confirmDeleteTodo} className="btn btn-danger" style={{ flex: 1 }}>
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

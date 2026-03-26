import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Pencil, CheckCircle2, Circle } from 'lucide-react';
import TodoModal from '../components/TodoModal';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
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
      setTodos(todosData.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setErrorMsg(error.message); // Explicitly display Firebase rules failure
    });

    return unsubscribe;
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

  const deleteTodo = async (todoId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this list?");
      if (!confirmed) return;
      await deleteDoc(doc(db, 'todos', todoId));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>My Dashboard</h1>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {todos.map(todo => (
            <div key={todo.id} className="glass" style={{ 
              backgroundColor: todo.color, color: '#1e1e24', 
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              transition: 'transform 0.2s ease', 
              cursor: 'default'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', wordBreak: 'break-word', flex: 1 }}>{todo.heading}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(todo)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(0,0,0,0.5)', padding: '0.2rem' }} title="Edit List">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => deleteTodo(todo.id)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(0,0,0,0.5)', padding: '0.2rem' }} title="Delete List">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                {todo.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => toggleItemDone(todo.id, idx)}>
                    <div style={{ color: item.done ? 'var(--accent-success)' : 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center' }}>
                      {item.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <span style={{ 
                      textDecoration: item.done ? 'line-through' : 'none', 
                      opacity: item.done ? 0.6 : 1,
                      wordBreak: 'break-word',
                      flex: 1,
                      fontSize: '1.05rem'
                    }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={openNewModal}
        className="btn btn-primary"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '60px', height: '60px', borderRadius: '50%',
          boxShadow: '0 4px 15px rgba(99,102,241,0.5)', zIndex: 50, padding: 0
        }}
        aria-label="Add new todo"
        title="Add new todo"
      >
        <Plus size={30} />
      </button>

      <TodoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTodo} initialData={editingTodo} />
    </div>
  );
}

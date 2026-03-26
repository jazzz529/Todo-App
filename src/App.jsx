import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <>
      {currentUser && <Navbar />}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

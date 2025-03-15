import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/login';
import Register from './components/Register/register';
import MainApp from './components/MainApp/MainApp';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    console.log('Login data received:', userData);
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/messages" 
          element={
            user ? (
              <MainApp userInfo={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
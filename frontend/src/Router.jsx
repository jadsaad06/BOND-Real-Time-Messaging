import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login/login';
import MainApp from './components/MainApp/MainApp';
import Register from './components/Register/register';
function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? 
          <Navigate to="/app" replace /> : 
          <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={
          isAuthenticated ? 
          <MainApp onLogout={handleLogout}/> : 
          <Navigate to="/" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
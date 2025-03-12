import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError('');
      
      if (!email || !password) {
        setError('Please fill out all fields');
        return;
      }

      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password
      });

      if (response.data) {
        onLogin({
          username: response.data.username,
          friends: response.data.friends
        });
        navigate('/messages');
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 404:
            setError('User not found');
            break;
          case 400:
            setError('Invalid credentials');
            break;
          default:
            setError('Login failed. Please try again.');
        }
      } else {
        setError('Network error. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Bond</h1>
      <div className="login-form">
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
        <button className="login-button" onClick={() => navigate('/register')}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Login;
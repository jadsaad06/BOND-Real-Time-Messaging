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

        if (response.data && response.data.token) {
            // Store token
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            // Store user data
            const userData = response.data.user;
            localStorage.setItem('userData', JSON.stringify(userData));

            // Pass user data to main app
            onLogin(userData);
            
            navigate('/messages');
        } else {
            setError('Invalid response from server');
        }
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response) {
        switch (err.response.status) {
          case 404:
            setError(`User not found: ${err.response.data.message}`);
            break;
          case 400:
            setError(`Invalid request: ${err.response.data.message}`);
            break;
          case 401:
            setError(`Authentication failed: ${err.response.data.message}`);
            break;
          default:
            setError(`Login failed: ${err.response.data.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('No response from server. Check your connection.');
      } else {
        setError(`Request failed: ${err.message}`);
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
        <button className="login-button" onClick={async () => await handleLogin()}>
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
import './register.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    try {
      setError('');
  
      if (!username || !email || !password || !confirmPassword) {
        setError('Please fill out all fields');
        return;
      }
  
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
  
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
  
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
  
      const response = await axios.post('http://localhost:5000/auth/register', {
        username,
        email,
        password
      });
  
      if (response.status === 201) {
        // Registration successful
        navigate('/');
      } else {
        setError('Error registering user');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };
  
  return (
    <div className="login-container">
      <h1 className="login-title">Bond</h1>
      <div className="login-form">
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="login-input"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="login-button" onClick={handleRegister}>
          Register
        </button>
        <button className="login-button" onClick={() => navigate('/')}>
          Already have an account?
        </button>
      </div>
    </div>
  );
}

export default Register;
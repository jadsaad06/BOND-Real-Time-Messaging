import './register.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = () => {
    if(!username || !password || !confirmPassword) {
      alert('Please fill out all fields');
      return;
    }

    if(password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Register user

    navigate('/');
  }

  return (
    <div className="login-container">
      <h1 className="login-title">Bond</h1>
      <div className="login-form">
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          onChange={(e) => setUsername(e.target.value)}
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
      </div>
    </div>
  );
}

export default Register;
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Register from './register';

// Mock axios
jest.mock('axios');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const MockRegister = () => {
  return (
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form', () => {
    render(<MockRegister />);
    
    expect(screen.getByText('Bond')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  test('displays error when fields are empty', async () => {
    render(<MockRegister />);
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(screen.getByText('Please fill out all fields')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(<MockRegister />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'invalidemail' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  test('checks if passwords match', async () => {
    render(<MockRegister />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'DifferentPassword123!' }
    });
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('validates password strength - length', async () => {
    render(<MockRegister />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Pass1!' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Pass1!' }
    });
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  test('validates password strength - numbers', async () => {
    render(<MockRegister />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password!' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password!' }
    });
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
    });
  });

  test('validates password strength - special characters', async () => {
    render(<MockRegister />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password123' }
    });
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one special character')).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    axios.post.mockResolvedValueOnce({ status: 201 });
    
    render(<MockRegister />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles registration error', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Email already exists' }
      }
    });
    
    render(<MockRegister />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  test('navigates to login page when "Already have an account?" is clicked', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(<MockRegister />);
    
    fireEvent.click(screen.getByText('Already have an account?'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
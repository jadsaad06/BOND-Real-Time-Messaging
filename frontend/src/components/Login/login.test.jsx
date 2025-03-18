import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from './login';

// Mock axios
jest.mock('axios');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const MockLogin = ({ onLogin }) => {
  return (
    <BrowserRouter>
      <Login onLogin={onLogin} />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  test('renders login form', () => {
    render(<MockLogin onLogin={() => {}} />);
    
    expect(screen.getByText('Bond')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('displays error when fields are empty', async () => {
    render(<MockLogin onLogin={() => {}} />);
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('Please fill out all fields')).toBeInTheDocument();
    });
  });

  test('handles network error', async () => {
    axios.post.mockRejectedValueOnce({
      request: {},
      message: 'Network Error'
    });
    
    render(<MockLogin onLogin={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('No response from server. Check your connection.')).toBeInTheDocument();
    });
  });

  test('navigates to register page when register button is clicked', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(<MockLogin onLogin={() => {}} />);
    
    fireEvent.click(screen.getByText('Register'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
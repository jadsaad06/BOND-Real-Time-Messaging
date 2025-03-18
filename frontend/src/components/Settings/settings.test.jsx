import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from './settings';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');

describe('Settings Component', () => {
  const mockUserInfo = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockBlockedUsers = [
    { _id: 'block1', username: 'blockeduser1', profilePic: 'http://localhost:5000/blocked1.jpg' },
    { _id: 'block2', username: 'blockeduser2', profilePic: 'http://localhost:5000/blocked2.jpg' },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/auth/users/user123/blocklist')) {
        return Promise.resolve({ data: mockBlockedUsers });
      } else if (url.includes('/auth/users/search')) {
        return Promise.resolve({ 
          data: [
            { _id: 'user456', username: 'searchuser', profilePic: 'http://localhost:5000/search1.jpg' }
          ] 
        });
      }
      return Promise.resolve({ data: {} });
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders settings component', () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    expect(screen.getByText('Change Email')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText('Edit Block List')).toBeInTheDocument();
    expect(screen.getByText('2 Factor Authentication')).toBeInTheDocument();
  });

  test('toggles email change form', () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open email change form
    fireEvent.click(screen.getByText('Change Email'));
    
    // Verify form is displayed
    expect(screen.getByText('New Email')).toBeInTheDocument();
    expect(screen.getByText('Current Password (for verification)')).toBeInTheDocument();
    expect(screen.getByText('Update Email')).toBeInTheDocument();
    
    // Click to close form
    fireEvent.click(screen.getByText('Cancel'));
    
    // Verify form is hidden
    expect(screen.queryByText('New Email')).not.toBeInTheDocument();
  });

  test('toggles password change form', () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open password change form
    fireEvent.click(screen.getByText('Change Password'));
    
    // Verify form is displayed
    expect(screen.getByText('Current Password')).toBeInTheDocument();
    expect(screen.getByText('New Password')).toBeInTheDocument();
    expect(screen.getByText('Confirm New Password')).toBeInTheDocument();
    
    // Click to close form
    fireEvent.click(screen.getByText('Cancel'));
    
    // Verify form is hidden
    expect(screen.queryByText('Current Password')).not.toBeInTheDocument();
  });

  test('toggles block list section', async () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open block list section
    fireEvent.click(screen.getByText('Edit Block List'));
    
    // Verify block list section is displayed
    expect(screen.getByText('Blocked Users')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search users to block...')).toBeInTheDocument();
    
    // Wait for blocked users to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/blocklist`,
        expect.any(Object)
      );
    });
    
    // Verify blocked users are displayed
    expect(screen.getByText('blockeduser1')).toBeInTheDocument();
    expect(screen.getByText('blockeduser2')).toBeInTheDocument();
  });

  test('toggles 2FA section', async () => {
    render(<Settings userInfo={mockUserInfo} />);

    // Click on 2FA section header
    const twoFAHeader = screen.getByText('2 Factor Authentication');
    fireEvent.click(twoFAHeader);

    // Check if 2FA content is visible
    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText(/Enable two-factor authentication/)).toBeInTheDocument();
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
  });

  test('email change functionality', async () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open email change form
    fireEvent.click(screen.getByText('Change Email'));
    
    // Mock axios patch for email change
    axios.patch.mockResolvedValueOnce({ data: { message: 'Email updated successfully' } });
    
    // Fill in form
    const emailInput = screen.getByPlaceholderText('Enter new email');
    const passwordInput = screen.getByPlaceholderText('Enter current password');
    
    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form
    const updateButton = screen.getByText('Update Email');
    fireEvent.click(updateButton);
    
    // Verify email update
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/email`,
        { newEmail: 'newemail@example.com', password: 'password123' },
        expect.any(Object)
      );
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Email updated successfully')).toBeInTheDocument();
    });
  });

  test('password change functionality', async () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open password change form
    fireEvent.click(screen.getByText('Change Password'));
    
    // Mock axios patch for password change
    axios.patch.mockResolvedValueOnce({ data: { message: 'Password updated successfully' } });
    
    // Fill in form
    const oldPasswordInput = screen.getByPlaceholderText('Enter current password');
    const newPasswordInput = screen.getByPlaceholderText('Enter new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
    
    fireEvent.change(oldPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    // Submit form
    const updateButton = screen.getByText('Update Password');
    fireEvent.click(updateButton);
    
    // Verify password update
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/password`,
        { oldPassword: 'oldpassword', newPassword: 'newpassword123' },
        expect.any(Object)
      );
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Password updated successfully')).toBeInTheDocument();
    });
  });

  test('search and block user functionality', async () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open block list section
    fireEvent.click(screen.getByText('Edit Block List'));
    
    // Wait for blocked users to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/blocklist`,
        expect.any(Object)
      );
    });
    
    // Search for user to block
    const searchInput = screen.getByPlaceholderText('Search users to block...');
    fireEvent.change(searchInput, { target: { value: 'searchuser' } });
    
    // Mock axios post for blocking user
    axios.post.mockResolvedValueOnce({ data: { message: 'User blocked successfully' } });
    
    // Click search button
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    // Wait for search results
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/auth/users/search',
        expect.any(Object)
      );
    });
    
    // Block user
    await waitFor(() => {
      const blockButton = screen.getByText('Block');
      fireEvent.click(blockButton);
    });
    
    // Verify user blocked
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/block/user456`,
        {},
        expect.any(Object)
      );
    });
  });

  test('unblock user functionality', async () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open block list section
    fireEvent.click(screen.getByText('Edit Block List'));
    
    // Wait for blocked users to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/blocklist`,
        expect.any(Object)
      );
    });
    
    // Mock axios delete for unblocking user
    axios.delete.mockResolvedValueOnce({ data: { message: 'User unblocked successfully' } });
    
    // Unblock user
    await waitFor(() => {
      const unblockButtons = screen.getAllByText('Unblock');
      fireEvent.click(unblockButtons[0]);
    });
    
    // Verify user unblocked
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/block/block1`,
        expect.any(Object)
      );
    });
  });

  test('toggle 2FA functionality', async () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open 2FA section
    fireEvent.click(screen.getByText('2 Factor Authentication'));
    
    // Mock axios patch for 2FA toggle
    axios.patch.mockResolvedValueOnce({ data: { message: '2FA status updated' } });
    
    // Toggle 2FA
    const toggleSwitch = screen.getByRole('checkbox');
    fireEvent.click(toggleSwitch);
    
    // Verify 2FA toggle
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/2fa`,
        { enabled: true },
        expect.any(Object)
      );
    });
  });

  test('shows validation errors for email change', async () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open email change form
    fireEvent.click(screen.getByText('Change Email'));
    
    // Submit form without input
    const updateButton = screen.getByText('Update Email');
    fireEvent.click(updateButton);
    
    // Verify error message
    expect(screen.getByText('Email cannot be empty')).toBeInTheDocument();
  });

  test('shows validation errors for password change', async () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open password change form
    fireEvent.click(screen.getByText('Change Password'));
    
    // Fill in form with mismatched passwords
    const oldPasswordInput = screen.getByPlaceholderText('Enter current password');
    const newPasswordInput = screen.getByPlaceholderText('Enter new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
    
    fireEvent.change(oldPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
    
    // Submit form
    const updateButton = screen.getByText('Update Password');
    fireEvent.click(updateButton);
    
    // Verify error message
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    
    // Fill in form with short password
    fireEvent.change(newPasswordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    
    // Submit form
    fireEvent.click(updateButton);
    
    // Verify error message
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  test('toggle password visibility', () => {
    render(<Settings userInfo={mockUserInfo} />);
    
    // Click to open password change form
    fireEvent.click(screen.getByText('Change Password'));
    
    // Check password field is hidden by default
    const passwordInput = screen.getByPlaceholderText('Enter new password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Toggle password visibility using aria-label
    const toggleButton = screen.getByLabelText('Toggle password visibility');
    fireEvent.click(toggleButton);
    
    // Check password is now visible
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Toggle back
    fireEvent.click(toggleButton);
    
    // Check password is hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainApp from './MainApp';
import axios from 'axios';
import { io } from 'socket.io-client';

// Mock dependencies
jest.mock('axios');
jest.mock('socket.io-client');

// Mock socket functionality
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};
io.mockReturnValue(mockSocket);

describe('MainApp Component', () => {
  const mockUserInfo = {
    _id: 'user123',
    username: 'testuser',
    profilePicture: 'http://localhost:5000/profilepic.jpg',
  };
  
  const mockFriends = [
    { _id: 'friend1', username: 'friend1', profilePic: 'http://localhost:5000/profilepic.jpg' },
    { _id: 'friend2', username: 'friend2', profilePic: 'http://localhost:5000/profilepic.jpg' },
  ];
  
  const mockMessages = [
    { _id: 'msg1', sender: 'user123', receiver: 'friend1', content: 'Hello!' },
    { _id: 'msg2', sender: 'friend1', receiver: 'user123', content: 'Hi there!' },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/friends')) {
        return Promise.resolve({ data: mockFriends });
      } else if (url.includes('/messages/')) {
        return Promise.resolve({ data: mockMessages });
      } else if (url.includes('/profile/profilePicture/')) {
        return Promise.resolve({ data: { profilePicture: '/profilepic.jpg' } });
      } else if (url.includes('/auth/users/search')) {
        return Promise.resolve({ data: [{ _id: 'user456', username: 'searchuser' }] });
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

  test('renders main app components', async () => {
    render(
      <BrowserRouter>
        <MainApp userInfo={mockUserInfo} onLogout={jest.fn()} />
      </BrowserRouter>
    );

    // Check if main elements are rendered
    expect(screen.getByText('Bond')).toBeInTheDocument();
    expect(screen.getByText(mockUserInfo.username)).toBeInTheDocument();
    
    // Wait for friends to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/friends`,
        expect.any(Object)
      );
    });
  });

  test('toggles profile settings when profile button is clicked', async () => {
    render(
      <BrowserRouter>
        <MainApp userInfo={mockUserInfo} onLogout={jest.fn()} />
      </BrowserRouter>
    );

    // Click profile button
    fireEvent.click(screen.getByText(mockUserInfo.username));
    
    // Check if profile settings are displayed
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Change Picture')).toBeInTheDocument();
    
    // Click again to close
    fireEvent.click(screen.getByText(mockUserInfo.username));
    
    // Check if profile settings are hidden
    await waitFor(() => {
      expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument();
    });
  });

  test('toggles settings when settings button is clicked', async () => {
    render(
      <BrowserRouter>
        <MainApp onLogout={() => {}} userInfo={mockUserInfo} />
      </BrowserRouter>
    );

    const settingsIcon = screen.getByTestId('settings-button');
    fireEvent.click(settingsIcon);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  test('toggles add friend when add friend button is clicked', async () => {
    render(
      <BrowserRouter>
        <MainApp onLogout={() => {}} userInfo={mockUserInfo} />
      </BrowserRouter>
    );

    const addFriendButton = screen.getByTestId('add-friend-button');
    fireEvent.click(addFriendButton);

    await waitFor(() => {
      expect(screen.getByText('Add Friend')).toBeInTheDocument();
    });
  });

  test('shows manage friends when manage friends button is clicked', async () => {
    render(
      <BrowserRouter>
        <MainApp onLogout={() => {}} userInfo={mockUserInfo} />
      </BrowserRouter>
    );

    const manageFriendsButton = screen.getByTestId('manage-friends-button');
    fireEvent.click(manageFriendsButton);

    await waitFor(() => {
      expect(screen.getByText('Manage Friends')).toBeInTheDocument();
    });
  });

  test('search users and add friend functionality', async () => {
    render(
      <BrowserRouter>
        <MainApp onLogout={() => {}} userInfo={mockUserInfo} />
      </BrowserRouter>
    );

    // Wait for friends to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/friends`,
        expect.any(Object)
      );
    });

    // Find add friend button by test-id instead of text
    const addFriendButton = screen.getByTestId('add-friend-button');
    fireEvent.click(addFriendButton);
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search by username...');
    fireEvent.change(searchInput, { target: { value: 'searchuser' } });
    
    // Mock axios post for adding friend
    axios.patch.mockResolvedValueOnce({ 
      data: { 
        message: 'Friend added', 
        friends: [...mockFriends.map(f => f._id), 'user456'] 
      } 
    });
    
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
    
    // Add friend
    await waitFor(() => {
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);
    });
    
    // Verify friend added
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/friends/'),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  test('logout functionality', async () => {
    const mockLogout = jest.fn();
    render(
      <BrowserRouter>
        <MainApp userInfo={mockUserInfo} onLogout={mockLogout} />
      </BrowserRouter>
    );

    // Open profile settings
    fireEvent.click(screen.getByText(mockUserInfo.username));
    
    // Click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Verify logout function called
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('sends message when send button is clicked', async () => {
    render(
      <BrowserRouter>
        <MainApp onLogout={() => {}} userInfo={mockUserInfo} />
      </BrowserRouter>
    );

    // Wait for friends to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/friends`,
        expect.any(Object)
      );
    });

    // First select a friend to chat with
    const friendButton = screen.getByText('friend1');
    fireEvent.click(friendButton);

    await waitFor(() => {
      const messageInput = screen.getByTestId('message-input');
      expect(messageInput).toBeInTheDocument();
    });

    const messageInput = screen.getByTestId('message-input');
    const sendButton = screen.getByText('Send');

    fireEvent.change(messageInput, { target: { value: 'Hello, friend!' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello, friend!')).toBeInTheDocument();
    });
  });

  test('username change functionality', async () => {
    render(
      <BrowserRouter>
        <MainApp userInfo={mockUserInfo} onLogout={jest.fn()} />
      </BrowserRouter>
    );

    // Open profile settings
    fireEvent.click(screen.getByText(mockUserInfo.username));
    
    // Mock axios patch for username change
    axios.patch.mockResolvedValueOnce({ data: { message: 'Username updated successfully' } });
    
    // Change username
    const usernameInput = screen.getByDisplayValue(mockUserInfo.username);
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    
    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Verify username update
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/username`,
        { newUsername: 'newusername' },
        expect.any(Object)
      );
    });
  });

  test('removes friend when remove button is clicked', async () => {
    render(
      <BrowserRouter>
        <MainApp onLogout={() => {}} userInfo={mockUserInfo} />
      </BrowserRouter>
    );

    // Wait for friends to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:5000/auth/users/${mockUserInfo._id}/friends`,
        expect.any(Object)
      );
    });

    // Find manage friends button by test-id
    const manageFriendsButton = screen.getByTestId('manage-friends-button');
    fireEvent.click(manageFriendsButton);
    
    // Mock axios delete for removing friend
    axios.delete.mockResolvedValueOnce({ data: { message: 'Friend removed' } });
    axios.delete.mockResolvedValueOnce({ data: { message: 'Messages deleted' } });
    
    // Remove friend
    await waitFor(() => {
      const removeButtons = screen.getAllByTitle('Remove Friend');
      fireEvent.click(removeButtons[0]);
    });
    
    // Verify friend removed
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/auth/friends/'),
        expect.any(Object)
      );
    });
  });
});
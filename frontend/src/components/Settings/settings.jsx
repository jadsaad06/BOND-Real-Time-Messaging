import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaUserLock } from 'react-icons/fa';
import './settings.css';

function Settings({ userInfo }) {
  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeSuccess, setEmailChangeSuccess] = useState('');

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Block list state
  const [showBlockList, setShowBlockList] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockSearch, setBlockSearch] = useState('');
  const [blockSearchResults, setBlockSearchResults] = useState([]);
  
  // 2FA state
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Get blocked users when component mounts
  useEffect(() => {
    if (showBlockList) {
      getBlockedUsers();
    }
  }, [showBlockList]);

  const getBlockedUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/auth/users/${userInfo._id}/blocklist`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      setBlockedUsers(response.data);
    } catch (error) {
      console.error('Error fetching blocked users:', error.response?.data?.message || error.message);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailChangeError('');
    setEmailChangeSuccess('');
    
    if (!newEmail.trim()) {
      setEmailChangeError('Email cannot be empty');
      return;
    }
    
    try {
      const response = await axios.patch(`http://localhost:5000/auth/users/${userInfo._id}/email`, 
        { newEmail, password: currentPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      setEmailChangeSuccess('Email updated successfully');
      setNewEmail('');
      setCurrentPassword('');
      setTimeout(() => {
        setShowEmailChange(false);
        setEmailChangeSuccess('');
      }, 2000);
      
    } catch (error) {
      setEmailChangeError(error.response?.data?.message || 'Error updating email');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    try {
      const response = await axios.patch(`http://localhost:5000/auth/users/${userInfo._id}/password`, 
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      setPasswordSuccess('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordSuccess('');
      }, 2000);
      
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Error updating password');
    }
  };

  const searchUsers = async () => {
    if (!blockSearch.trim()) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/auth/users/search`, {
        params: { username: blockSearch },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Filter out already blocked users and current user
      const filteredResults = response.data.filter(user => 
        user._id !== userInfo._id && 
        !blockedUsers.some(blockedUser => blockedUser._id === user._id)
      );
      
      setBlockSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const blockUser = async (userId) => {
    try {
      const response = await axios.post(`http://localhost:5000/auth/users/${userInfo._id}/block/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      // Refresh blocked users list
      getBlockedUsers();
      // Clear search results
      setBlockSearchResults([]);
      setBlockSearch('');
      
    } catch (error) {
      console.error('Error blocking user:', error.response?.data?.message || error.message);
    }
  };

  const unblockUser = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/auth/users/${userInfo._id}/block/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      // Update blocked users list
      setBlockedUsers(blockedUsers.filter(user => user._id !== userId));
      
    } catch (error) {
      console.error('Error unblocking user:', error.response?.data?.message || error.message);
    }
  };

  const toggleTwoFactor = async () => {
    try {
      const response = await axios.patch(`http://localhost:5000/auth/users/${userInfo._id}/2fa`, 
        { enabled: !twoFactorEnabled },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      setTwoFactorEnabled(!twoFactorEnabled);
      
    } catch (error) {
      console.error('Error toggling 2FA:', error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="settings-content">
      {/* Change Email Setting */}
      <div className="setting" onClick={() => setShowEmailChange(!showEmailChange)}>
        <h2>Change Email</h2>
      </div>
      
      {showEmailChange && (
        <div className="setting-expanded">
          <form onSubmit={handleChangeEmail} className="setting-form">
            <div className="form-group">
              <label>New Email</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className="setting-input"
              />
            </div>
            <div className="form-group">
              <label>Current Password (for verification)</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="setting-input"
              />
            </div>
            {emailChangeError && <div className="error-message">{emailChangeError}</div>}
            {emailChangeSuccess && <div className="success-message">{emailChangeSuccess}</div>}
            <div className="form-actions">
              <button type="submit" className="save-button">Update Email</button>
              <button 
                type="button" 
                onClick={() => setShowEmailChange(false)} 
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Change Password Setting */}
      <div className="setting" onClick={() => setShowPasswordChange(!showPasswordChange)}>
        <h2>Change Password</h2>
      </div>
      
      {showPasswordChange && (
        <div className="setting-expanded">
          <form onSubmit={handleChangePassword} className="setting-form">
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="setting-input"
              />
            </div>
            <div className="form-group password-input-container">
              <label>New Password</label>
              <div className="password-field">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="setting-input"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="setting-input"
              />
            </div>
            {passwordError && <div className="error-message">{passwordError}</div>}
            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
            <div className="form-actions">
              <button type="submit" className="save-button">Update Password</button>
              <button 
                type="button" 
                onClick={() => setShowPasswordChange(false)} 
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit Block List Setting */}
      <div className="setting" onClick={() => setShowBlockList(!showBlockList)}>
        <h2>Edit Block List</h2>
      </div>
      
      {showBlockList && (
        <div className="setting-expanded">
          <div className="blocklist-container">
            <h3>Blocked Users</h3>
            <div className="block-search-container">
              <input 
                type="text" 
                value={blockSearch}
                onChange={(e) => setBlockSearch(e.target.value)}
                placeholder="Search users to block..."
                className="block-search-input"
              />
              <button onClick={searchUsers} className="block-search-button">Search</button>
            </div>
            
            {/* Search Results */}
            {blockSearchResults.length > 0 && (
              <div className="block-search-results">
                <h4>Search Results</h4>
                {blockSearchResults.map(user => (
                  <div key={user._id} className="block-user-item">
                    <div className="block-user-info">
                      <img src={user.profilePic} alt={user.username} className="block-user-pfp" />
                      <span className="block-user-username">{user.username}</span>
                    </div>
                    <button 
                      onClick={() => blockUser(user._id)} 
                      className="block-user-button"
                    >
                      <FaUserLock /> Block
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Blocked Users List */}
            <div className="blocked-users-list">
              <h4>Currently Blocked</h4>
              {blockedUsers.length > 0 ? (
                blockedUsers.map(user => (
                  <div key={user._id} className="blocked-user-item">
                    <div className="blocked-user-info">
                      <img src={user.profilePic} alt={user.username} className="blocked-user-pfp" />
                      <span className="blocked-user-username">{user.username}</span>
                    </div>
                    <button 
                      onClick={() => unblockUser(user._id)} 
                      className="unblock-user-button"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-blocked-users">You haven't blocked any users yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 2 Factor Authentication Setting */}
      <div className="setting" onClick={() => setShowTwoFactor(!showTwoFactor)}>
        <h2>2 Factor Authentication</h2>
      </div>
      
      {showTwoFactor && (
        <div className="setting-expanded">
          <div className="twofa-container">
            <h3>Two-Factor Authentication</h3>
            <p className="twofa-description">
              Enable two-factor authentication to add an extra layer of security to your account.
              When enabled, you'll need to provide a verification code sent to your email in addition to your password when logging in.
            </p>
            <div className="twofa-toggle">
              <span>Status: {twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={twoFactorEnabled} 
                  onChange={toggleTwoFactor}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
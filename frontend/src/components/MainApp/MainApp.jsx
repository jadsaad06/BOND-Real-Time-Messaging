import React, { useState, useEffect, useRef } from 'react';
import './MainApp.css';
import './addFriend.css';
import './profile.css';
import './manageFriends.css';
import { useNavigate } from 'react-router-dom';
import {FaCog, FaUserEdit, FaSignOutAlt, FaPlus, FaMinus, FaUserTimes, FaBan} from 'react-icons/fa';
import axios from 'axios';
import Settings from '../Settings/settings';
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

function MainApp({onLogout, userInfo}) {
    const navigate = useNavigate(); 
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

      
    const [messages, setMessages] = useState([]);
    const [currMessage, setCurrMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [displayName, setDisplayName] = useState(userInfo?.username);
    const [profilePic, setProfilePic] = useState(userInfo?.profilePicture);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [showManageFriends, setShowManageFriends] = useState(false);
    const [tempDisplayName, setTempDisplayName] = useState(displayName);
    const [usernameChangeError, setUsernameChangeError] = useState('');
    const [usernameChangeSuccess, setUsernameChangeSuccess] = useState('');
    const [friends, setFriends] = useState([]);
    const [users, setUsers] = useState([{username: userInfo?.username, profilePic: ''}]);
    const [friendSearch, setFriendSearch] = useState('');
    const [currFriend, setCurrFriend] = useState({}); // holds id, username, pfp

    useEffect(() => {
       getFriends();
    }, []);

    useEffect(() => {
      if(currFriend._id){
        getMessages();
      }
    }, [currFriend]);

    useEffect(() => {
      if (userInfo?._id) { // Ensure userInfo exists before joining
          socket.emit("joinRoom", userInfo._id);
      }
    }, [userInfo]);

  // Replace the existing socket useEffect with this updated version
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      console.log("Received message via WebSocket:", data);
      console.log("Current friend ID:", currFriend._id);
      console.log("Sender ID:", data.sender);
      if(currFriend._id && data.sender === currFriend._id.toString()){
        setMessages((prev) => [...prev, { 
          text: data.content.trim(), 
          type: 'received',
          userID: data.sender
        }]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [currFriend]); // Add currFriend as a dependency

    const getMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/messages/${userInfo._id}/${currFriend._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });

        if(response.status !== 200){
          console.error('Error fetching messages:', response.data.message);
          return;
        }

        setMessages(response.data.map((message) => ({
          text: message.content,
          type: message.sender === userInfo._id ? 'sent' : 'received',
          userID: message.sender
        })));

      } catch (error) {
        if(error.response && error.response.status === 404){
          setMessages([]);
        }else if (error.response && error.response.status === 403) {
          console.error('Access denied:', error.response.data.message);
        } else {
          console.error('Error fetching messages:', error.response?.data?.message || error.message);
        }
      }
    };

    const fetchFriendProfilePicture = async (friendId) => {
      try {
        const response = await axios.get(
          `http://localhost:5000/profile/profilePicture/${friendId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.profilePicture) {
          return `http://localhost:5000${response.data.profilePicture}`;
        }
        return null;
      } catch (error) {
        console.error('Error fetching friend profile picture:', error);
        return null;
      }
    };

    const getFriends = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/users/${userInfo._id}/friends`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
    
        // Fetch profile pictures for each friend
        const friendsWithPics = await Promise.all(
          response.data.map(async (friend) => {
            const profilePic = await fetchFriendProfilePicture(friend._id);
            return {
              ...friend,
              profilePic: profilePic || '/default-profile.png' // Add a default profile picture path
            };
          })
        );
    
        setFriends(friendsWithPics);
        console.log('Friends with profile pictures:', friendsWithPics);
      } catch (error) {
        console.error('Error fetching friends:', error.response?.data?.message || error.message);
      }
    };
            

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]); // Scroll when messages update

    const toggleAddFriend = () => {
      setShowAddFriend(!showAddFriend);

      if(!showAddFriend){
        setUsers([]);
        setFriendSearch('');
      }

      if(showProfile){
        setShowProfile(!showProfile);
      }

      if(showSettings){
        setShowSettings(!showSettings);
      }
      
      if(showManageFriends){
        setShowManageFriends(!showManageFriends);
      }
    }
    
    const toggleSettings = () => {
      setShowSettings(!showSettings);
  
      if(showProfile){
        setShowProfile(!showProfile);
      }
  
      if(showAddFriend){
        setShowAddFriend(!showAddFriend);
      }

      if(showManageFriends){
        setShowManageFriends(!showManageFriends);
      }
    }
  
    const toggleProfile = () => {
      setShowProfile(!showProfile);
      
      // If focus is changed, but display name is not updated, make sure they align
      if(tempDisplayName != displayName){
        setTempDisplayName(displayName);
      }

      if(showSettings){
        setShowSettings(!showSettings);
      }
      if(showAddFriend){
        setShowAddFriend(!showAddFriend);
      }
      if(showManageFriends){
        setShowManageFriends(!showManageFriends);
      }
    };

    const toggleManageFriends = () => {
      setShowManageFriends(!showManageFriends);

      if(showProfile){
        setShowProfile(!showProfile);
      }
      if(showSettings){
        setShowSettings(!showSettings);
      }
      if(showAddFriend){
        setShowAddFriend(!showAddFriend);
      }
    };
  
    const handleLogout = () => {
      onLogout(); // Call onLogout function passed from Router
      navigate('/'); // Navigate to login page
    };

    const handleSaveName = async () => {
      setUsernameChangeError('');
      setUsernameChangeSuccess('');
      
      if (!tempDisplayName.trim()) {
        setUsernameChangeError('Username cannot be empty');
        return;
      }
      
      try {
        const response = await axios.patch(`http://localhost:5000/auth/users/${userInfo._id}/username`, 
          { newUsername: tempDisplayName },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        setDisplayName(tempDisplayName);
        setUsernameChangeSuccess('Username updated successfully');
        
        setTimeout(() => {
          setUsernameChangeSuccess('');
        }, 2000);
        
      } catch (error) {
        if (error.response?.data?.message === "Username is already in use") {
          setUsernameChangeError('This username is already taken');
        } else {
          setUsernameChangeError(error.response?.data?.message || 'Error updating username');
        }
      }
    };

    const handleSendMessage = async () => {
      if (currMessage.trim() && currMessage.length <= 200) {
        try {
          const messageData = {
            sender: userInfo._id,
            receiver: currFriend._id,
            content: currMessage
          };

          socket.emit('sendMessage', messageData);

          setMessages((prevMessages) => [...prevMessages, { 
            text: currMessage, 
            type: 'sent',
            userID: userInfo._id
          }]);
          setCurrMessage('');

          const response = await axios.post('http://localhost:5000/messages/send', messageData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

        } catch (error) {
          console.error('Error sending message:', error.response?.data?.message || error.message);
        }
      } else {
        alert('Message must be between 1 and 200 characters');
      }
    };
    
    const handleFileSelect = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('profilePicture', file);
          
          console.log('Uploading file:', file.name);
          
          const response = await axios.post(
            `http://localhost:5000/profile/uploadProfilePicture?userId=${userInfo._id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          console.log('Upload response:', response.data);
          
          // Use the profilePicture path directly from the response
          if (response.data.profilePicture) {
            const profilePicUrl = `http://localhost:5000${response.data.profilePicture}`;
            setProfilePic(profilePicUrl);
            console.log('Profile pic updated:', profilePicUrl);
          }
        } catch (error) {
          console.error('Error uploading profile picture:', error.response?.data || error.message);
          alert('Failed to upload profile picture');
        }
      }
    };
    
    const searchUsers = async (searchQuery) => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/users/search`, {
          params: { username: searchQuery },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
    
        // Fetch profile pictures for search results
        const usersWithPics = await Promise.all(
          response.data
            .filter(user => user._id !== userInfo._id)
            .map(async (user) => {
              const profilePic = await fetchFriendProfilePicture(user._id);
              return {
                ...user,
                profilePic: profilePic || '/default-profile.png'
              };
            })
        );
    
        setUsers(usersWithPics);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

  const handleAddFriend = async (friend) => {
    try {
      const response = await axios.patch(`http://localhost:5000/auth/friends/${friend._id}?userId=${userInfo._id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      }
    );
  
      console.log(response.data.message); // "Friend added" or "Friend removed"
      console.log('Updated Friends List:', response.data.friends); // Updated list of friend IDs
  
      setFriends([...friends, friend]);
      setShowAddFriend(false);
      console.log(response.data.message); // "Friend added" or "Friend removed"
      console.log('Updated friends list:', response.data.friends);
      return response.data;
  } catch (error) {
      console.error('Error updating friends:', error.response?.data?.message || error.message);
      return;
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      // Remove friend from the database
      const deleteFriendResponse = await axios.delete(`http://localhost:5000/auth/friends/${friendId}?userId=${userInfo._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
  
      console.log(deleteFriendResponse.data.message); // "Friend removed"
  
      // Update friends list after removal
      setFriends(friends.filter(friend => friend._id !== friendId));
  
      // If current friend was removed, clear the chat
      if (currFriend._id === friendId) {
        setCurrFriend({});
        setMessages([]);
      }
      // Remove chat messages if they exist
      try {
        const deleteMessageResponse = await axios.delete(`http://localhost:5000/messages/${userInfo._id}/${friendId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        });
        console.log(deleteMessageResponse.data.message); // "Messages deleted"
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('No messages to delete');
        } else {
          console.error('Error removing message thread:', error.response?.data?.message || error.message);
        }
      }
    } catch (error) {
    console.error('Error removing friend:', error.response?.data?.message || error.message);
  }
};
  
  const handleBlockUser = async (userId) => {
    try {
      axios.post(`http://localhost:5000/blockAUser`, { blockedId: userId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      alert(`User blocked successfully!`);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleSelectFriend = async (friend) => {
    const profilePic = await fetchFriendProfilePicture(friend._id);
    setCurrFriend({
      _id: friend._id,
      username: friend.username,
      profilePic: profilePic || '/default-profile.png'
    });
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!userInfo?._id) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/profile/profilePicture/${userInfo._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.profilePicture) {
          setProfilePic(`http://localhost:5000${response.data.profilePicture}`);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [userInfo]);
  
    return (
      <div className="App">
        <header className="main-container">
          <profile className="profile-container">
            <button className="profile-button" onClick={toggleProfile}>
              <img className="pfp" src={profilePic} alt="Profile Picture" />
              <h2>{displayName}</h2>
            </button>
          </profile>
            <h1 className='title'>Bond</h1>
            <button 
              className="settings-button" 
              data-testid="settings-button"
              onClick={toggleSettings}  // Move onClick to button
            >
              <FaCog className="settings-icon" />
            </button>
        </header>
        <div className="app-body-container">
          {showProfile && (
            <div className="profile-modal">
              <h1 className="profile-title">Profile Settings</h1>
              <div className="profile-content">
                <div className="profile-picture-section">
                  <img src={profilePic} alt="Profile" className="profile-preview" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="change-picture-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaUserEdit /> Change Picture
                  </button>
                </div>
                <div className="profile-setting">
                  <h2>Username</h2>
                  <div className="profile-input-container">
                    <input
                      type="text"
                      value={tempDisplayName}
                      onChange={(e) => setTempDisplayName(e.target.value)}
                      className="profile-input"
                    />
                    <button className="save-button" onClick={handleSaveName}>
                      Save
                    </button>
                  </div>
                  {usernameChangeError && <div className="error-message">{usernameChangeError}</div>}
                  {usernameChangeSuccess && <div className="success-message">{usernameChangeSuccess}</div>}
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
          {showSettings && (
            <div className="settings-container">
              <h1 className="settings-title">Settings</h1>
              <Settings userInfo={userInfo} />
            </div>
          )}
          {showAddFriend && (
            <div className="add-friend-modal">
              <h1 className="add-friend-title">Add Friend</h1>
              <div className="add-friend-content">
                <div className="friend-search-container">
                  {users.map((user) => (
                    <div key={user.id} className="search-result">
                      <img src={user.profilePic} alt={user.username} className="search-pfp" />
                      <span className="search-username">{user.username}</span>
                      <button className="add-friend-button" onClick={() => handleAddFriend(user)}>
                        Add
                      </button>
                    </div>
                  ))}
                  <input 
                    type="text" 
                    placeholder="Search by username..."
                    className="friend-search-input"
                    onChange={(e) => setFriendSearch(e.target.value)}
                  />
                  <button className="friend-search-button" onClick={async () => await searchUsers(friendSearch)}>
                    Search
                  </button>
                </div>
                <div className="search-results">
                </div>
              </div>
            </div>
          )}
          {showManageFriends && (
            <div className="manage-friends-modal">
              <h1 className="manage-friends-title">Manage Friends</h1>
              <div className="manage-friends-content">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <div key={friend._id} className="friend-manage-item">
                      <div className="friend-info">
                        <img src={friend.profilePic} alt={friend.username} className="friend-manage-pfp" />
                        <span className="friend-manage-username">{friend.username}</span>
                      </div>
                      <div className="friend-actions">
                        <button 
                          className="remove-friend-button" 
                          onClick={() => handleRemoveFriend(friend._id)}
                          title="Remove Friend"
                        >
                          <FaUserTimes />
                        </button>
                        <button 
                          className="block-friend-button" 
                          onClick={() => handleBlockUser(friend._id)}
                          title="Block User"
                        >
                          <FaBan />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-friends-message">You don't have any friends yet.</div>
                )}
              </div>
            </div>
          )}
          <sidebar className="sidebar">
            <div className="friends-header">
              <button 
                className="manage-friend-container" 
                data-testid="manage-friends-button"
                onClick={toggleManageFriends}
              >
                <FaMinus className="manage-friend-icon" />
              </button>
              <h1 className="sidebar-title">Friends</h1>
              <button 
                className="add-friend-container" 
                data-testid="add-friend-button"
                onClick={toggleAddFriend}
              >
                <FaPlus className="add-friend-icon" />
              </button>
            </div>
            <div className="friends-list">
              {friends.map((friend) => (
                <button key={friend._id} className="friend-item" onClick={() => handleSelectFriend(friend)}>
                  <img 
                    src={friend.profilePic} 
                    alt={friend.username} 
                    className="friend-pfp"
                  />
                  <span className="friend-username">{friend.username}</span>
                </button>
              ))}
            </div>
          </sidebar>
          <div className="chat-container">
            <div className="chats-title">Bonding with {currFriend?.username ? currFriend?.username : "..."}</div>
            <div className="message-container">
              {messages.length == 0 && !currFriend?.username ? (
                <div className="no-messages">
                  Add a friend or click on a chat to get started
                </div>
              ) : (
                <div className="messages-wrapper">
                  {messages.map((message, index) => (
                    <div key={index} className={`message-${message.type}`}>
                      <div className="message-text">{message.text}</div>
                      <img 
                        className="pfp" 
                        src={message.type === 'sent' ? profilePic : currFriend.profilePic} 
                        alt={`${message.type === 'sent' ? 'Your' : `${currFriend.username}'s`} profile`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
              {currFriend?.username && <div className="message-input-container">
                <input 
                  type="text"
                  className="message-input"
                  placeholder="Type a message..."
                  value={currMessage}
                  onChange={(e) => setCurrMessage(e.target.value)}
                  data-testid="message-input"
                />
                <button 
                  className="send-button" 
                  onClick={handleSendMessage}
                  data-testid="send-button"
                >
                  Send
                </button>
              </div>}
          </div>
        </div>
      </div>
  ); 
  }

  export default MainApp;
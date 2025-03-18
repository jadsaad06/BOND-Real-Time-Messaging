import React, { useState, useEffect, useRef } from 'react';
import './MainApp.css';
import './addFriend.css';
import './profile.css';
import './settings.css';
import { useNavigate } from 'react-router-dom';
import {FaCog, FaUserEdit, FaSignOutAlt, FaPlus} from 'react-icons/fa';
import axios from 'axios';
//import { io } from "socket.io-client";
//const socket = io("http://localhost:5000");

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
    const [tempDisplayName, setTempDisplayName] = useState(displayName);
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

    /*useEffect(() => {
      // Join user’s room when component mounts
      socket.emit("joinRoom", userId);

      // Listen for incoming messages
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      return () => {
        socket.disconnect(); // Cleanup on unmount
      };
    }, [userId]);*/

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
        })));
    
        console.log('Messages:', response.data);
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

    const getFriends = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/users/${userInfo._id}/friends`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        setFriends(response.data);
        console.log('Friends:', response.data);
      } catch (error) {
        console.error('Error fetching friends:', error.response?.data?.message || error.message);
      }

    }
            

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
      
    }
    
    const toggleSettings = () => {
      setShowSettings(!showSettings);
  
      if(showProfile){
        setShowProfile(!showProfile);
      }
  
      if(showAddFriend){
        setShowAddFriend(!showAddFriend);
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
    };
  
    const handleLogout = () => {
      onLogout(); // Call onLogout function passed from Router
      navigate('/'); // Navigate to login page
    };

    const handleSaveName = () => {
      if(tempDisplayName.trim() && tempDisplayName.length <= 20){
        setDisplayName(tempDisplayName);
        setTempDisplayName(tempDisplayName);
      }
    }

    const handleSendMessage = async () => {
      if (currMessage.trim() && currMessage.length <= 200) {
        try {
          const messageData = {
            sender: userInfo._id,
            receiver: currFriend._id,
            content: currMessage
          };
    
          console.log('Sending message:', messageData);
    
          const response = await axios.post('http://localhost:5000/messages/send', messageData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
    
          setMessages((prevMessages) => [...prevMessages, { text: currMessage, type: 'sent' }]);
          setCurrMessage('');
        } catch (error) {
          console.error('Error sending message:', error.response?.data?.message || error.message);
        }
      } else {
        alert('Message must be between 1 and 200 characters');
      }
    };
    
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePic(reader.result);
        };
        reader.readAsDataURL(file);
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
          const searchResult = response.data.filter(user => user._id !== userInfo._id);
          setUsers(searchResult);
      } catch (error) {
          console.error('Error searching users:', error);
      }
  };

  const handleAddFriend = async (friend) => {
    try {
      const response = await axios.patch(`http://localhost:5000/auth/friends/${friend._id}?userId=${userInfo._id}`, {userId: userInfo.id}, {
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
      throw error; // Rethrow to handle in UI
    }
  };

  const handleSelectFriend = (friend) =>{
    setCurrFriend(
      {
        _id: friend._id,
        username: friend.username,
        profilePic: friend.profilePic
      }
    );
  };
  
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
            <button className="settings-button">
              <FaCog className="settings-icon" onClick={toggleSettings}/>
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
                  <h2>Display Name</h2>
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
              <div className="settings-content">
                <div className="setting">
                  <h2>Change Email</h2>
                </div>
                <div className="setting">
                  <h2>Change Password</h2>
                </div>
                <div className="setting">
                  <h2>Edit Block List</h2>
                </div>
                <div className="setting">
                  <h2>2 Factor Authentication</h2>
                </div>
              </div>
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
          <sidebar className="sidebar">
            <div className="friends-header">
              <h1 className="sidebar-title">Friends</h1>
              <button className="add-friend-container" onClick={toggleAddFriend}>
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
                      <img className="pfp" src={(message.userID === userInfo.id) ? userInfo.profilePic : currFriend.profilePic} alt="Profile" />
                    </div>
                  ))}
                </div>
              )}
            </div>
              {currFriend?.username && <div className="message-input-container">
                <input className="message-input" placeholder="Type a message..." value={currMessage} onChange={(e) => setCurrMessage(e.target.value)}/>
                <button className="send-button" onClick={handleSendMessage}>Send</button>
              </div>}
          </div>
        </div>
      </div>
  ); 
  }

  export default MainApp;
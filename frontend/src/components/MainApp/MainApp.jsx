import React, { useState } from 'react';
import './MainApp.css';
import './addFriend.css';
import './profile.css';
import './settings.css';
import { useNavigate } from 'react-router-dom';
import {FaCog, FaUserEdit, FaSignOutAlt, FaPlus} from 'react-icons/fa';


function MainApp() {
    const [messages, setMessages] = useState([
      { text: 'Hello!', type: 'sent' },
      { text: 'Hi!', type: 'received' },
      { text: 'How are you?', type: 'sent' },
      { text: 'Good, you?', type: 'received' },
      { text: "I'm good too!", type: 'sent' },
      { text: "That's great!", type: 'received' }
    ]);
    
    const [currMessage, setCurrMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [displayName, setDisplayName] = useState('James Bond');
    const [profilePic, setProfilePic] = useState('data:image/jpeg;base64,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');
    const [recipientPFP, setRecipientPFP] = useState('data:image/png;base64,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');
    const [showAddFriend, setShowAddFriend] = useState(false);
  
    const navigate = useNavigate();
  
    const toggleAddFriend = () => {
      setShowAddFriend(!showAddFriend);
  
      if(showProfile){
        setShowProfile(!showProfile);
      }
      if(showSettings){
        setShowSettings(!showSettings);
      }
    };
  
    const handleSendMessage = () => {
      if (currMessage.trim()) {
        setMessages([...messages, { text: currMessage, type: 'sent' }]);
        setCurrMessage(''); // Reset input
      }
    };
    
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
  
      if(showSettings){
        setShowSettings(!showSettings);
      }
      if(showAddFriend){
        setShowAddFriend(!showAddFriend);
      }
    };
  
    const handleLogout = () => {
      console.log('Logging out...');
      navigate('/Login');
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
                  <button className="change-picture-btn">
                    <FaUserEdit /> Change Picture
                  </button>
                </div>
                <div className="profile-setting">
                  <h2>Display Name</h2>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="profile-input"
                  />
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
                  <input 
                    type="text" 
                    placeholder="Search by username..."
                    className="friend-search-input"
                  />
                  <button className="friend-search-button">
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
          </sidebar>
          <div className="chat-container">
          <div className="message-container">
            {messages.map((message, index) => (
                  <div key={index} className={`message-${message.type}`}>
                    <p className="message-text">{message.text}</p>
                    <img className="pfp" src={message.type === 'sent' ? profilePic : recipientPFP} alt="Profile Picture" />
                  </div>
                ))}
          </div>
            <div className="message-input-container">
              <input className="message-input" placeholder="Type a message..." value={currMessage} onChange={(e) => setCurrMessage(e.target.value)} />
              <button className="send-button" onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
  );
  }

  export default MainApp;
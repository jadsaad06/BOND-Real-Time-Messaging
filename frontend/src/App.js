import { useState } from 'react';
import './App.css';
import './settings.css';
import './profile.css';
import { FaCog, FaPlus, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';

function App() {
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
  const [profilePic, setProfilePic] = useState('https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg');

  const handleSendMessage = () => {
    if (currMessage.trim()) {
      setMessages([...messages, { text: currMessage, type: 'sent' }]);
      setCurrMessage(''); // Reset input
    }
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  }

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
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
        <sidebar className="sidebar">
          <div className="friends-header">
            <h1 className="sidebar-title">Friends</h1>
            <button className="add-friend-container">
              <FaPlus className="add-friend-icon" />
            </button>
          </div>
        </sidebar>
        <div className="chat-container">
        <div className="message-container">
          {messages.map((message, index) => (
                <div key={index} className={`message-${message.type}`}>
                  <p className="message-text">{message.text}</p>
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

export default App;
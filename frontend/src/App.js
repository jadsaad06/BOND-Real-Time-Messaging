import { useState } from 'react';
import './App.css';
import { FaCog, FaPlus } from 'react-icons/fa';


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
  
  const handleSendMessage = () => {
    if (currMessage.trim()) {
      setMessages([...messages, { text: currMessage, type: 'sent' }]);
      setCurrMessage(''); // Reset input
    }
  };
  
  
  return (
    <div className="App">
      <header className="main-container">
        <profile className="profile-container">
          <button className="profile-button">
            <img className="pfp" src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=" alt="Profile Picture" />
            <h2>James Bond</h2>
          </button>
        </profile>
          <h1 className='title'>Bond</h1>
          <FaCog className="settings-icon" />
      </header>
      <div className="app-body-container">
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
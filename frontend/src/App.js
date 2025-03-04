import './App.css';
import { FaCog, FaPlus } from 'react-icons/fa';

function App() {
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
            <FaPlus className="add-friend-icon" />
          </div>
        </sidebar>
        <div className="chat-container">
          <chats>
            <h1 className="chats-title">Chats</h1>
          </chats>
          <div className="message-container">
            <div className="message">
              <p className="message-text">Hello!</p>
            </div>
            <div className="message">
              <p className="message-text">Hi!</p>
            </div>
            <div className="message">
              <p className="message-text">How are you?</p>
            </div>
            <div className="message">
              <p className="message-text">Good, you?</p>
            </div>
            <div className="message">
              <p className="message-text">I'm good too!</p>
            </div>
            <div className="message">
              <p className="message-text">That's great!</p>
            </div>
          </div>
          <div className="message-input-container">
            <input className="message-input" placeholder="Type a message..." />
            <button className="send-button">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
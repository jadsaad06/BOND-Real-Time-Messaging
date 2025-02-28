import './App.css';
import { FaCog } from 'react-icons/fa';

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
          <h1 className="sidebar-title">Friends</h1>
        </sidebar>
        <div className="chat-container">
          <chats>
            <h1 className="chats-title">Chats</h1>
          </chats>
        </div>
      </div>
    </div>
  );
}

export default App;
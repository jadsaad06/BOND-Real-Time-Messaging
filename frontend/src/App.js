import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages(prevMessages => [
        ...prevMessages,
        { id: Math.random().toString(), text: message }
      ]);
      setMessage(''); // Clear the input field after sending
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Instant Messaging</h1>
      </div>

      <div className="messages-container">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          className="message-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
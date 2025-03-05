import React, { useState } from "react";
import "./ChatWindow.css"; // Import CSS file for styling

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "You" }]);
      setInput(""); // Clear input
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Messages */}
      <div className="chat-box">
        {messages.length === 0 ? (
          <p className="empty-message">No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === "You" ? "sent" : "received"}`}>
              {msg.text}
            </div>
          ))
        )}
      </div>

      {/* Input Field & Button */}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;

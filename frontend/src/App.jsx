import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", { autoConnect: false });

export default function ChatApp() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  
    const handleReceiveMessage = (newMessage) => {
      console.log(`📩 Received message:`, newMessage);
      setMessages((prev) => [...prev, newMessage]);
    };
  
    const handleChatHistory = (history) => {
      console.log(`📜 Received chat history:`, history);
      setMessages(history);
    };
  
    // Register event listeners
    socket.on("receive_message", handleReceiveMessage);
    socket.on("chat_history", handleChatHistory);
  
    // Cleanup function to avoid duplicate listeners
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("chat_history", handleChatHistory);
    };
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinRoom = () => {
    if (room && username) {
      socket.emit("join_room", { room, username });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leave_room", { room, username });
    setJoined(false);
    setMessages([]);
  };

  // const sendMessage = () => {
  //   if (message) {
  //     const newMessage = {
  //       room,
  //       username,
  //       text: message,
  //       timestamp: new Date().toLocaleTimeString(),
  //     };

  //     socket.emit("send_message", newMessage);
  //     setMessages((prev) => [...prev, { ...newMessage, self: true }]);
  //     setMessage("");
  //   }
  // };
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        room,
        username,
        text: message,
        timestamp: new Date().toLocaleTimeString(),
      };
  
      socket.emit("send_message", newMessage);
      setMessage(""); // Just clear input, DO NOT update messages state here
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg">
        {!joined ? (
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold text-center text-blue-400">Join a Chat Room</h2>
            <input
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username"
            />
            <input
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter Room ID"
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-200"
              onClick={joinRoom}
            >
              Join Room
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[500px]">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-xl font-semibold text-green-400">Room: {room}</h2>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition duration-200"
                onClick={leaveRoom}
              >
                Leave Room
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-700 p-3 rounded-lg space-y-3 scrollbar-hide">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 ${
                    msg.username === username ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-xs text-sm ${
                      msg.username === username
                        ? "bg-blue-500 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    <strong className="block text-xs text-gray-300">
                      {msg.username === username ? "You" : msg.username}
                    </strong>
                    {msg.text}
                    <span className="block text-xs text-gray-400 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex space-x-2">
              <input
                className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
              />
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-lg transition duration-200"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


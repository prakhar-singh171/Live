import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Create socket connection
const socket = io("http://localhost:3001", { autoConnect: false });

export default function ChatApp() {
  // Load room and username from localStorage (if available)
  const [room, setRoom] = useState(() => localStorage.getItem("room") || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);

  // Setup socket listeners (runs once on mount)
  useEffect(() => {
    socket.connect();

    const handleReceiveMessage = (newMessage) => {
      console.log("📩 Received message:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleChatHistory = (history) => {
      console.log("📜 Received chat history:", history);
      setMessages(history);
    };

    const handleMessageUpdated = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, text: data.newText, timestamp: data.timestamp }
            : msg
        )
      );
    };

    const handleMessageDeleted = (data) => {
      setMessages((prev) =>
        prev.filter((msg) => msg._id.toString() !== data.messageId.toString())
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("chat_history", handleChatHistory);
    socket.on("message_updated", handleMessageUpdated);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("chat_history", handleChatHistory);
      socket.off("message_updated", handleMessageUpdated);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, []);

  // Auto-scroll to the latest message and mark messages as seen
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (joined) {
      socket.emit("mark_seen", { room, username });
    }
  }, [ joined, room, username]);

  // Auto-join on mount only once if room & username exist in localStorage
  useEffect(() => {
    const storedRoom = localStorage.getItem("room");
    const storedUsername = localStorage.getItem("username");
    if (storedRoom && storedUsername && !joined) {
      setRoom(storedRoom);
      setUsername(storedUsername);
      joinRoom();
    }
  }, []); // Only run once on mount

  const joinRoom = () => {
    if (room && username) {
      socket.emit("join_room", { room, username });
      setJoined(true);
      localStorage.setItem("room", room);
      localStorage.setItem("username", username);
    }
  };

  const leaveRoom = () => {
    socket.emit("leave_room", { room, username });
    setJoined(false);
    setMessages([]);
    localStorage.removeItem("room");
    localStorage.removeItem("username");
    // Clear state so new values can be entered without auto-joining
    setRoom("");
    setUsername("");
  };

  const sendMessage = () => {
    if (message) {
      const newMessage = {
        room,
        username,
        text: message,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit("send_message", newMessage);
      setMessage("");
    }
  };

  // Functions to update and delete messages
  const updateMessage = (messageId, newText) => {
    socket.emit("update_message", { messageId, newText, room, username });
  };

  const deleteMessage = (messageId) => {
    socket.emit("delete_message", { messageId, room, username });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {!joined ? (
        <>
          <input
            className="border p-2 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
          />
          <input
            className="border p-2 w-full mt-2"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-2"
            onClick={joinRoom}
          >
            Join Room
          </button>
        </>
      ) : (
        <>
          <button
            className="bg-red-500 text-white px-4 py-2 mt-2"
            onClick={leaveRoom}
          >
            Leave Room
          </button>
          <div className="mt-4">
            <input
              className="border p-2 w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button
              className="bg-green-500 text-white px-4 py-2 mt-2"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
          <div className="mt-4 border p-4 max-h-80 overflow-auto flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <Message
                key={index}
                msg={msg}
                username={username}
                updateMessage={updateMessage}
                deleteMessage={deleteMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}
    </div>
  );
}

// Message component with update, delete, and toggled "seen by" functionality
function Message({ msg, username, updateMessage, deleteMessage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(msg.text);
  const [showSeen, setShowSeen] = useState(false);

  const handleUpdate = () => {
    updateMessage(msg._id, newText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMessage(msg._id);
  };

  return (
    <div
      className={`p-3 rounded-lg max-w-60 text-sm ${
        msg.username === username
          ? "bg-green-500 text-white self-end text-right"
          : "bg-black text-white self-start text-left"
      }`}
    >
      <strong className="block text-xs">
        {msg.username === username ? "You" : msg.username}
      </strong>
      {isEditing ? (
        <div>
          <input
            type="text"
            className="p-1 rounded text-black w-full"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button
            onClick={handleUpdate}
            className="text-green-200 text-xs mt-1 mr-2"
          >
            Update
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-300 text-xs mt-1"
          >
            Cancel
          </button>
        </div>
      ) : (
        <p>{msg.text}</p>
      )}
      <span className="block text-xs text-gray-300 text-right">
        {msg.timestamp}
      </span>
      {msg.username === username && !isEditing && (
        <div className="flex justify-end space-x-2 mt-1">
          <button
            onClick={() => setIsEditing(true)}
            className="text-yellow-300 text-xs"
          >
            Edit
          </button>
          <button onClick={handleDelete} className="text-red-300 text-xs">
            Delete
          </button>
        </div>
      )}
      <div className="mt-1">
        <button
          onClick={() => setShowSeen(!showSeen)}
          className="text-blue-300 text-xs"
        >
          {showSeen ? "Hide Seen Info" : "Show Seen Info"}
        </button>
      </div>
      {showSeen && (
        <div className="mt-1 text-xs text-gray-400">
          Seen by:{" "}
          {msg.seenBy && msg.seenBy.length > 0
            ? msg.seenBy.join(", ")
            : "None"}
        </div>
      )}
    </div>
  );
}

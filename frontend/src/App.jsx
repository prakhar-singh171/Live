import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Create a single socket connection (adjust URL as needed)
const socket = io("http://localhost:3001", { autoConnect: false });

export default function ChatApp() {
  // Chat & poll states
  const [room, setRoom] = useState(() => localStorage.getItem("room") || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [message, setMessage] = useState("");
  // We'll store both chat messages and poll events in a unified array called 'events'
  const [events, setEvents] = useState([]);
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);

  // Poll creation states
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]); // At least 2 options

  // Setup socket listeners (run once on mount)
  useEffect(() => {
    socket.connect();

    // Chat event handlers
    const handleReceiveMessage = (newMessage) => {
      console.log("📩 Received message:", newMessage);
      const event = {
        ...newMessage,
        type: "chat",
        createdAt: newMessage.createdAt ? newMessage.createdAt : Date.now(),
      };
      setEvents((prev) => sortEvents([...prev, event]));
    };

    const handleChatHistory = (history) => {
      console.log("📜 Received chat history:", history);
      const chatEvents = history.map((msg) => ({
        ...msg,
        type: "chat",
        createdAt: msg.createdAt ? msg.createdAt : Date.now(),
      }));
      setEvents(chatEvents);
    };

    // Poll event handlers
    const handlePollHistory = (polls) => {
      console.log("📝 Received poll history:", polls);
      const pollEvents = polls.map((poll) => ({
        ...poll,
        type: "poll",
        createdAt: poll.createdAt ? poll.createdAt : Date.now(),
      }));
      setEvents((prev) => sortEvents([...prev, ...pollEvents]));
    };

    const handlePollCreated = (newPoll) => {
      console.log("📝 Poll created:", newPoll);
      const pollEvent = {
        ...newPoll,
        type: "poll",
        createdAt: newPoll.createdAt ? newPoll.createdAt : Date.now(),
      };
      setEvents((prev) => sortEvents([...prev, pollEvent]));
    };

    const handlePollUpdated = (updatedPoll) => {
      console.log("📝 Poll updated:", updatedPoll);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.type === "poll" && ev._id === updatedPoll._id
            ? { ...updatedPoll, type: "poll", createdAt: ev.createdAt }
            : ev
        )
      );
    };

    // Message update and delete handlers
    const handleMessageUpdated = (data) => {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.type === "chat" && ev._id === data.messageId
            ? { ...ev, text: data.newText, timestamp: data.timestamp }
            : ev
        )
      );
    };

    const handleMessageDeleted = (data) => {
      setEvents((prev) =>
        prev.filter((ev) => ev.type !== "chat" || ev._id.toString() !== data.messageId.toString())
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("chat_history", handleChatHistory);
    socket.on("poll_history", handlePollHistory);
    socket.on("poll_created", handlePollCreated);
    socket.on("poll_updated", handlePollUpdated);
    socket.on("message_updated", handleMessageUpdated);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("chat_history", handleChatHistory);
      socket.off("poll_history", handlePollHistory);
      socket.off("poll_created", handlePollCreated);
      socket.off("poll_updated", handlePollUpdated);
      socket.off("message_updated", handleMessageUpdated);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, []);

  // Auto-scroll to latest event (chat or poll)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // Mark messages as seen when joined, room, or username changes (but not on every update)
  useEffect(() => {
    if (joined) {
      socket.emit("mark_seen", { room, username });
    }
  }, [joined, room, username]);

  // Auto-join on mount if room and username exist in localStorage (runs once)
  useEffect(() => {
    const storedRoom = localStorage.getItem("room");
    const storedUsername = localStorage.getItem("username");
    if (storedRoom && storedUsername && !joined) {
      setRoom(storedRoom);
      setUsername(storedUsername);
      joinRoom(storedRoom, storedUsername);
    }
  }, [joined]);

  // Helper: sort events by createdAt (ascending)
  const sortEvents = (eventsArray) => {
    return eventsArray.sort((a, b) => a.createdAt - b.createdAt);
  };

  const joinRoom = (r = room, u = username) => {
    if (r && u) {
      socket.emit("join_room", { room: r, username: u });
      setJoined(true);
      localStorage.setItem("room", r);
      localStorage.setItem("username", u);
    }
  };

  const leaveRoom = () => {
    socket.emit("leave_room", { room, username });
    setJoined(false);
    setEvents([]);
    localStorage.removeItem("room");
    localStorage.removeItem("username");
    setRoom("");
    setUsername("");
  };

  const sendMessage = () => {
    if (message) {
      const newMessage = {
        room,
        username,
        text: message,
        timestamp: new Date().toLocaleString(), // date and time
        createdAt: Date.now(),
        type: "chat",
      };
      socket.emit("send_message", newMessage);
      setMessage("");
    }
  };

  // Poll functions
  const createPoll = () => {
    const validOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (pollQuestion.trim() === "" || validOptions.length < 2) {
      alert("Enter a valid poll question and at least two options.");
      return;
    }
    const pollData = {
      room,
      question: pollQuestion,
      options: validOptions, // Backend converts these to option objects with votes and votedBy array
      createdAt: Date.now(),
    };
    socket.emit("create_poll", pollData);
    setShowPollForm(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  // Updated votePoll to send full payload
  const votePoll = (payload) => {
    socket.emit("vote_poll", payload);
  };

  const updateMessage = (messageId, newText) => {
    socket.emit("update_message", { messageId, newText, room, username });
  };

  const deleteMessage = (messageId) => {
    socket.emit("delete_message", { messageId, room, username });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {!joined ? (
        <div className="space-y-4">
          <input
            className="border p-2 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
          />
          <input
            className="border p-2 w-full"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button className="bg-blue-500 text-white px-4 py-2" onClick={() => joinRoom()}>
            Join Room
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button className="bg-red-500 text-white px-4 py-2" onClick={leaveRoom}>
            Leave Room
          </button>
          <div className="space-y-2">
            <input
              className="border p-2 w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button className="bg-green-500 text-white px-4 py-2" onClick={sendMessage}>
              Send
            </button>
          </div>
          {/* Scrollable container for events (chat messages and polls) */}
          <div className="mt-4 border p-4 max-h-80 overflow-auto flex flex-col space-y-2">
            {events.map((ev, index) =>
              ev.type === "chat" ? (
                <ChatMessage
                  key={ev._id || index}
                  message={ev}
                  username={username}
                  updateMessage={updateMessage}
                  deleteMessage={deleteMessage}
                />
              ) : (
                <PollComponent
                  key={ev._id || index}
                  poll={ev}
                  votePoll={(selectedOption) =>
                    votePoll({ pollId: ev._id, option: selectedOption, username })
                  }
                  username={username}
                />
              )
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Poll creation UI, outside scroll container */}
          <div className="space-y-2">
            <button
              className="bg-purple-500 text-white px-4 py-2"
              onClick={() => setShowPollForm(!showPollForm)}
            >
              {showPollForm ? "Cancel Poll Creation" : "Create Poll"}
            </button>
            {showPollForm && (
              <div className="border p-4">
                <input
                  className="border p-2 w-full"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Enter poll question"
                />
                {pollOptions.map((option, idx) => (
                  <input
                    key={idx}
                    className="border p-2 w-full mt-2"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[idx] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${idx + 1}`}
                  />
                ))}
                <button className="bg-blue-500 text-white px-4 py-2 mt-2" onClick={createPoll}>
                  Create Poll
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Component for displaying a chat message
function ChatMessage({ message, username, updateMessage, deleteMessage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(message.text);
  const [showSeen, setShowSeen] = useState(false);

  const handleUpdate = () => {
    updateMessage(message._id, newText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMessage(message._id);
  };

  return (
    <div
      className={`p-3 rounded-lg max-w-60 text-sm ${
        message.username === username
          ? "bg-green-500 text-white self-end text-right"
          : "bg-black text-white self-start text-left"
      }`}
    >
      <strong className="block text-xs">
        {message.username === username ? "You" : message.username}
      </strong>
      {isEditing ? (
        <div>
          <input
            type="text"
            className="p-1 rounded text-black w-full"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button onClick={handleUpdate} className="text-green-200 text-xs mt-1 mr-2">
            Update
          </button>
          <button onClick={() => setIsEditing(false)} className="text-gray-300 text-xs mt-1">
            Cancel
          </button>
        </div>
      ) : (
        <p>{message.text}</p>
      )}
      <span className="block text-xs text-gray-300 text-right">{message.timestamp}</span>
      {message.username === username && !isEditing && (
        <div className="flex justify-end space-x-2 mt-1">
          <button onClick={() => setIsEditing(true)} className="text-yellow-300 text-xs">
            Edit
          </button>
          <button onClick={handleDelete} className="text-red-300 text-xs">
            Delete
          </button>
        </div>
      )}
      <div className="mt-1">
        <button onClick={() => setShowSeen(!showSeen)} className="text-blue-300 text-xs">
          {showSeen ? "Hide Seen Info" : "Show Seen Info"}
        </button>
      </div>
      {showSeen && (
        <div className="mt-1 text-xs text-gray-400">
          Seen by: {message.seenBy && message.seenBy.length > 0 ? message.seenBy.join(", ") : "None"}
        </div>
      )}
    </div>
  );
}

// Component for displaying a poll and voting
function PollComponent({ poll, votePoll, username }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  // Ensure poll.options is always an array
  const options = Array.isArray(poll.options) ? poll.options : [];

  const handleVote = () => {
    if (!hasVoted) {
      if (selectedOption) {
        const payload = { pollId: poll._id, option: selectedOption, username };
        console.log("Emitting vote_poll with:", payload);
        votePoll(payload); // Ensure votePoll is correctly used
        setHasVoted(true);
      } else {
        alert("Please select an option.");
      }
    } else {
      alert("You have already voted.");
    }
  };

  return (
    <div className="p-4 border rounded text-sm bg-gray-100">
      <h3 className="font-bold text-lg">{poll.question}</h3>
      <div className="text-xs text-gray-500">
        Created: {new Date(poll.createdAt).toLocaleString()}
      </div>
      <ul>
        {options.map((opt, idx) => (
          <li key={opt._id || idx} className="flex items-center mt-2">
            <input
              type="radio"
              name={`poll-${poll._id}`}
              value={opt.option}
              onChange={(e) => setSelectedOption(e.target.value)}
              disabled={hasVoted}
              className="mr-2"
            />
            <span>
              {opt.option} ({opt.votes} votes)
            </span>
          </li>
        ))}
      </ul>
      <button
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleVote}
        disabled={hasVoted}
      >
        {hasVoted ? "Voted" : "Vote"}
      </button>
    </div>
  );
}

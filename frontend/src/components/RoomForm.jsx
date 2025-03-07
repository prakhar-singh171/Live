import { useState } from "react";

export default function RoomForm({ joinRoom }) {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Join a Chat Room</h1>
      
      <input
        className="w-80 p-3 mb-3 rounded-lg bg-gray-800 text-white outline-none"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      
      <input
        className="w-80 p-3 mb-3 rounded-lg bg-gray-800 text-white outline-none"
        placeholder="Enter Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      
      <button
        className="w-80 bg-green-600 hover:bg-green-500 px-4 py-3 rounded-lg"
        onClick={() => joinRoom(room, username)}
      >
        Join Room
      </button>
    </div>
  );
}

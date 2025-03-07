import { useAppContext } from "../context/AppContext";

export default function JoinRoomPage() {
  const { room, setRoom, username, setUsername, joinRoom } = useAppContext();

  return (
    <div className="p-6 max-w-md mx-auto">
      <input className="border p-2 w-full" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter Username" />
      <input className="border p-2 w-full mt-2" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Enter Room ID" />
      <button className="bg-blue-500 text-white px-4 py-2 mt-2" onClick={joinRoom}>Join Room</button>
    </div>
  );
}

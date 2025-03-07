import ChatWindow from "../components/ChatWindow";
import { useChatContext } from "../context/ChatContext";

export default function ChatPage() {
  const { room, username } = useChatContext();

  return room && username ? <ChatWindow room={room} username={username} /> : <p>Please join a room</p>;
}

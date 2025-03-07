import { useAppContext } from "../context/AppContext";

export const useChat = () => {
  const { room, username, setEvents } = useAppContext();

  const sendMessage = (messageText) => {
    if (!messageText) return;

    const message = {
      room,
      username,
      text: messageText,
      createdAt: Date.now(),
      type: "chat",
    };

    socket.emit("send_message", message);
  };

  return { sendMessage };
};

import { useState, useEffect } from "react";
import { socket } from "../services/socket";

export const useChat = (room, username) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (room && username) {
      socket.emit("join_room", { room, username });

      socket.on("receive_message", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on("chat_history", (history) => {
        setMessages(history);
      });

      return () => {
        socket.off("receive_message");
        socket.off("chat_history");
      };
    }
  }, [room, username]);

  const sendMessage = (text) => {
    const newMessage = {
      room,
      username,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    socket.emit("send_message", newMessage);
    setMessages((prev) => [...prev, { ...newMessage, self: true }]);
  };

  return { messages, sendMessage };
};

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppContext } from "../context/AppContext";

const socket = io("http://localhost:3001", { autoConnect: false });

export const useChat = () => {
  const { room, username } = useAppContext();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.connect();

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleChatHistory = (history) => {
      setMessages(history);
    };

    const handleMessageUpdated = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, text: data.newText, timestamp: data.timestamp } : msg
        )
      );
    };

    const handleMessageDeleted = (data) => {
      setMessages((prev) => prev.filter((msg) => msg._id.toString() !== data.messageId.toString()));
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (joined) {
      socket.emit("mark_seen", { room, username });
    }
  }, [joined, room, username]);

  useEffect(() => {
    if (room && username && !joined) {
      joinRoom();
    }
  }, []);

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

  const updateMessage = (messageId, newText) => {
    socket.emit("update_message", { messageId, newText, room, username });
  };

  const deleteMessage = (messageId) => {
    socket.emit("delete_message", { messageId, room, username });
  };

  return {
    message,
    setMessage,
    messages,
    messagesEndRef,
    joined,
    joinRoom,
    leaveRoom,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
};

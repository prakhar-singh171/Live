import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");

  return (
    <ChatContext.Provider value={{ room, setRoom, username, setUsername }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);

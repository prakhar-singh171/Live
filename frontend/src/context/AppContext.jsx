import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [room, setRoom] = useState(localStorage.getItem("room") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  return (
    <AppContext.Provider value={{ room, setRoom, username, setUsername }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

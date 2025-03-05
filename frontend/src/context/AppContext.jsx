import React, { createContext, useEffect, useState } from "react";

// Create Context
export const AppContext = createContext();

// Context Provider Component
export const AppProvider = ({ children }) => {

  
  const [users, setUser] = useState([]); // Example global state

  useEffect(()=>{
    
  })
  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

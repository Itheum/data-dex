import React from "react";
import { createContext, useState, useContext } from "react";

const userContext = createContext({});

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState({});

  return <userContext.Provider value={{ user, setUser }}>{children}</userContext.Provider>;
};

export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined) throw Error("UseUser must be wrapped inside userContextProvider");
  return context;
};

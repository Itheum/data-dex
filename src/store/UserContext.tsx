import React from "react";
import { createContext, useState, useContext } from "react";

export interface UserContextType {
  user: any;
  setUser: any;
}

const userContext = createContext<UserContextType>({
  user: undefined,
  setUser: undefined,
});

export const UserContextProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState({});

  return <userContext.Provider value={{ user, setUser }}>{children}</userContext.Provider>;
};

export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined) throw Error("UseUser must be wrapped inside userContextProvider");
  return context;
};

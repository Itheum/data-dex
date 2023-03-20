import React, { ReactElement } from "react";
import { createContext, useState, useContext } from "react";

export interface UserContextType {
  user: any;
  setUser: any;
}

const userContext = createContext<UserContextType>({
  user: undefined,
  setUser: undefined,
});

export const UserContextProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState({
    user: undefined,
    setUser: undefined,
  });

  return <userContext.Provider value={{ user, setUser }}>{children}</userContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context: UserContextType = useContext(userContext);
  if (context === undefined) throw Error("useUser must be wrapped inside userContextProvider");
  return context;
};

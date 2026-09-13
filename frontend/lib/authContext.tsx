"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, UserRole } from "./types";
import { DEMO_USERS } from "./accounts";

export { DEMO_USERS };

interface AuthContextType {
  user: AuthUser | null;
  ready: boolean;
  login: (username: string, role: UserRole, token?: string, email?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "secure_auth_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setReady(true);
  }, []);

  const login = (username: string, role: UserRole, token?: string, email?: string) => {
    const newUser: AuthUser = { username, role, token, email };
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

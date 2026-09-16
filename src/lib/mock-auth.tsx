"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const DEMO_USER: User = {
  id: "1",
  name: "Admin DPUPR Kab. Bogor",
  email: "admin@sijakon.bogor.go.id",
  role: "Super Admin",
};

const AuthContext = createContext<AuthContextType>({
  user: DEMO_USER,
  isAuthenticated: true,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USER);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("sijakon_user") : null;
      if (stored !== null) {
        setUser(stored ? JSON.parse(stored) : null);
      } else {
        setUser(DEMO_USER);
        localStorage.setItem("sijakon_user", JSON.stringify(DEMO_USER));
      }
    } catch {
      setUser(DEMO_USER);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === "admin@sijakon.bogor.go.id" && password === "demo2026") {
      setUser(DEMO_USER);
      localStorage.setItem("sijakon_user", JSON.stringify(DEMO_USER));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.setItem("sijakon_user", "");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

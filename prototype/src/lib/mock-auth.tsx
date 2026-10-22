"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { User, RoleCode, DEMO_USERS, hasRole as checkRole, hasPermission as checkPermission, ROLE_CONFIGS } from "./auth-types";
import { api } from "./api-client";

export * from "./auth-types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; targetRoute: string; user?: User; error?: string }>;
  logout: () => void;
  switchUser: (usernameOrRole: string) => void;
  hasRole: (roles: RoleCode[]) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  login: async () => ({ success: false, targetRoute: "/login" }),
  logout: () => {},
  switchUser: () => {},
  hasRole: () => false,
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("sijakon_user_v3") : null;
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Clear any legacy auto-seeded session so user is unauthenticated by default
        if (typeof window !== "undefined") {
          localStorage.removeItem("sijakon_user_v2");
        }
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = async (
    identifier: string, 
    password?: string
  ): Promise<{ success: boolean; targetRoute: string; user?: User; error?: string }> => {
    // 1. Panggil API client (mencoba backend real terlebih dahulu, dengan graceful fallback)
    const result = await api.auth.login(identifier, password);

    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem("sijakon_user_v3", JSON.stringify(result.user));

      const config = ROLE_CONFIGS[result.user.role];
      const targetRoute = config ? config.defaultRoute : "/";
      return { success: true, targetRoute, user: result.user };
    }

    return { 
      success: false, 
      targetRoute: "/login", 
      error: result.error || "Pengguna tidak ditemukan. Silakan gunakan salah satu akun demo." 
    };
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sijakon_user_v3");
      localStorage.removeItem("sijakon_user_v2");
      localStorage.removeItem("sijakon_access_token");
    }
  };

  const switchUser = (usernameOrRole: string) => {
    const target = DEMO_USERS[usernameOrRole] || Object.values(DEMO_USERS).find((u) => u.role === usernameOrRole);
    if (target) {
      setUser(target);
      localStorage.setItem("sijakon_user_v3", JSON.stringify(target));
      localStorage.setItem("sijakon_access_token", "demo_jwt_token_" + target.username);
    }
  };

  const hasRole = (roles: RoleCode[]): boolean => {
    return checkRole(user, roles);
  };

  const hasPermission = (resource: string, action: string): boolean => {
    return checkPermission(user, resource, action);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isInitialized,
        login, 
        logout, 
        switchUser, 
        hasRole, 
        hasPermission 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

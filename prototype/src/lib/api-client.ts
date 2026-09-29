import { User, RoleCode, DEMO_USERS, ROLE_CONFIGS } from "./auth-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: {
      id: string;
      code: RoleCode;
      name: string;
    };
    bujkId: string | null;
    permissions: string[];
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("sijakon_access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for snappy UX

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // 1. Auth Service
  auth = {
    login: async (identifier: string, password?: string): Promise<{ success: boolean; user?: User; error?: string; isBackend: boolean }> => {
      // 1.1 Coba panggil Backend API live
      try {
        const res = await this.request<LoginResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ identifier, password: password || "Demo2026!" }),
        });

        if (res.accessToken && res.user) {
          localStorage.setItem("sijakon_access_token", res.accessToken);
          localStorage.setItem("sijakon_refresh_token", res.refreshToken);

          const mappedUser: User = {
            id: res.user.id,
            username: res.user.username,
            name: res.user.fullName,
            email: res.user.email,
            role: res.user.role.code,
            roleLabel: res.user.role.name,
            bujkId: res.user.bujkId || undefined,
            permissions: res.user.permissions,
          };

          return { success: true, user: mappedUser, isBackend: true };
        }
      } catch (backendError: any) {
        // Backend offline / connection refused / auth error
        console.warn("[ApiClient] Backend API offline atau tidak dapat dijangkau, beralih ke simulasi demo lokal:", backendError.message);
      }

      // 1.2 Fallback ke simulasi demo offline
      const cleanId = identifier.trim().toLowerCase();
      const demoUser = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
      );

      if (demoUser) {
        // Simulasi token lokal
        localStorage.setItem("sijakon_access_token", "demo_jwt_token_" + demoUser.username);
        return { success: true, user: demoUser, isBackend: false };
      }

      return {
        success: false,
        error: "Pengguna tidak ditemukan di database backend maupun daftar demo.",
        isBackend: false,
      };
    },

    me: async (): Promise<User | null> => {
      try {
        const res = await this.request<any>("/auth/me");
        if (res) {
          return {
            id: res.id,
            username: res.username,
            name: res.fullName,
            email: res.email,
            role: res.role.code,
            roleLabel: res.role.name,
            bujkId: res.bujkId || undefined,
            permissions: res.permissions,
          };
        }
      } catch {
        // Backend offline, fallback to local storage
      }
      return null;
    },

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sijakon_access_token");
        localStorage.removeItem("sijakon_refresh_token");
      }
    },
  };

  // 2. Roles & RBAC Service
  roles = {
    getAll: async () => {
      return this.request<any[]>("/roles");
    },
    getPermissions: async (roleId: string) => {
      return this.request<any[]>(`/roles/${roleId}/permissions`);
    },
    updatePermissions: async (roleId: string, permissions: Array<{ resource: string; action: string; isGranted: boolean }>) => {
      return this.request<any>(`/roles/${roleId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions }),
      });
    },
  };
}

export const api = new ApiClient(API_BASE_URL);

"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { 
  User, 
  RoleCode, 
  DEMO_USERS, 
  hasRole as checkRole, 
  hasPermission as checkPermission, 
  ROLE_CONFIGS 
} from "./auth-types";
import { api } from "./api-client";
import { createClient, isSupabaseConfigured } from "./supabase/client";

export * from "./auth-types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isSupabase: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; targetRoute: string; user?: User; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (usernameOrRole: string) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  hasRole: (roles: RoleCode[]) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isSupabase: false,
  login: async () => ({ success: false, targetRoute: "/login" }),
  logout: async () => {},
  switchUser: () => {},
  resetPassword: async () => ({ success: false, message: "" }),
  hasRole: () => false,
  hasPermission: () => false,
});

async function fetchSupabaseProfile(authUserId: string, authEmail?: string): Promise<User | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data: profile, error }: { data: any; error: any } = await (supabase.from("profiles") as any)
      .select(`
        id, email, nama_lengkap, nip, jabatan, role, variant, 
        opd_id, bujk_id, bujk_name, phone, avatar_url, status, permissions,
        opd:opd_id ( id, kode, nama, nama_pendek )
      `)
      .eq("id", authUserId)
      .maybeSingle();

    if (error) {
      console.warn("[Auth] Peringatan membaca profil Supabase:", error.message);
    }

    if (!profile) {
      // Jika profile belum terbentuk dari trigger, gunakan metadata dasar
      const defaultUser: User = {
        id: authUserId,
        username: authEmail ? authEmail.split("@")[0] : "pengguna",
        name: authEmail ? authEmail.split("@")[0] : "Pengguna SIJAKON",
        email: authEmail || "user@sijakon.bogor.go.id",
        role: "EKSEKUTIF",
        roleLabel: ROLE_CONFIGS.EKSEKUTIF.label,
        instansi: "Pemerintah Kabupaten Bogor",
        permissions: ["dashboard:read"],
        isSupabaseUser: true,
      };
      return defaultUser;
    }

    const roleKey = (profile.role as RoleCode) || "EKSEKUTIF";
    const roleMeta = ROLE_CONFIGS[roleKey];
    const opdData = profile.opd as { id: string; kode: string; nama: string; nama_pendek?: string } | null;

    const mappedUser: User = {
      id: profile.id,
      username: profile.email.split("@")[0],
      name: profile.nama_lengkap,
      email: profile.email,
      role: roleKey,
      roleLabel: roleMeta ? roleMeta.label : profile.role,
      variant: profile.variant || undefined,
      variantLabel: profile.variant ? profile.variant.replace("_", " ") : undefined,
      bujkId: profile.bujk_id || undefined,
      bujkName: profile.bujk_name || undefined,
      instansi: opdData?.nama || "Dinas PU Kabupaten Bogor",
      opdId: profile.opd_id || undefined,
      opdName: opdData?.nama || undefined,
      nip: profile.nip || undefined,
      jabatan: profile.jabatan || undefined,
      phone: profile.phone || undefined,
      avatar: profile.avatar_url || undefined,
      permissions: Array.isArray(profile.permissions) && profile.permissions.length > 0
        ? (profile.permissions as string[])
        : (profile.role === "SUPER_ADMIN" ? ["*:*"] : ["dashboard:read"]),
      isSupabaseUser: true,
    };

    return mappedUser;
  } catch (err) {
    console.error("[Auth] Gagal memuat data profil Supabase:", err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    const hasSupabase = isSupabaseConfigured() && !!supabase;
    setIsSupabaseActive(hasSupabase);

    async function initAuth() {
      try {
        if (hasSupabase && supabase) {
          // 1. Coba periksa session aktif dari Supabase
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const profileUser = await fetchSupabaseProfile(session.user.id, session.user.email);
            if (profileUser && mounted) {
              setUser(profileUser);
              if (typeof window !== "undefined") {
                localStorage.setItem("sijakon_user_v3", JSON.stringify(profileUser));
              }
              setIsInitialized(true);
              return;
            }
          }
        }

        // 2. Fallback ke session tersimpan di localStorage (demo user)
        const stored = typeof window !== "undefined" ? localStorage.getItem("sijakon_user_v3") : null;
        if (stored && mounted) {
          setUser(JSON.parse(stored));
        } else {
          if (typeof window !== "undefined") {
            localStorage.removeItem("sijakon_user_v2");
          }
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.warn("[Auth] Inisialisasi auth gagal, beralih ke state kosong:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsInitialized(true);
      }
    }

    initAuth();

    // 3. Listener perubahan autentikasi Supabase
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (hasSupabase && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_OUT") {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("sijakon_user_v3");
          }
        } else if (event === "SIGNED_IN" && session?.user) {
          const profileUser = await fetchSupabaseProfile(session.user.id, session.user.email);
          if (profileUser && mounted) {
            setUser(profileUser);
            if (typeof window !== "undefined") {
              localStorage.setItem("sijakon_user_v3", JSON.stringify(profileUser));
            }
          }
        }
      });
      authListener = data;
    }

    return () => {
      mounted = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (
    identifier: string, 
    password?: string
  ): Promise<{ success: boolean; targetRoute: string; user?: User; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const supabase = createClient();
    const hasSupabase = isSupabaseConfigured() && !!supabase;

    // 1. Opsi Cepat Demo Account Bypass:
    // Jika user memilih akun demo atau mengetik kredensial demo default
    const isDemoAccount = Object.values(DEMO_USERS).some(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (isDemoAccount && (!password || password === "demo2026" || !hasSupabase)) {
      const result = await api.auth.login(identifier, password);
      if (result.success && result.user) {
        setUser(result.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("sijakon_user_v3", JSON.stringify(result.user));
        }
        const config = ROLE_CONFIGS[result.user.role];
        const targetRoute = config ? config.defaultRoute : "/";
        return { success: true, targetRoute, user: result.user };
      }
    }

    // 2. Login Nyata ke Supabase Auth
    if (hasSupabase && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password || "",
        });

        if (authError) {
          // Jika gagal di Supabase, coba cek apakah akun demo offline
          if (isDemoAccount) {
            const result = await api.auth.login(identifier, password);
            if (result.success && result.user) {
              setUser(result.user);
              if (typeof window !== "undefined") {
                localStorage.setItem("sijakon_user_v3", JSON.stringify(result.user));
              }
              const config = ROLE_CONFIGS[result.user.role];
              return { success: true, targetRoute: config ? config.defaultRoute : "/", user: result.user };
            }
          }

          return {
            success: false,
            targetRoute: "/login",
            error: authError.message.includes("Invalid login credentials")
              ? "Kombinasi email atau kata sandi tidak valid."
              : authError.message,
          };
        }

        if (authData.user) {
          const profileUser = await fetchSupabaseProfile(authData.user.id, authData.user.email);
          if (profileUser) {
            setUser(profileUser);
            if (typeof window !== "undefined") {
              localStorage.setItem("sijakon_user_v3", JSON.stringify(profileUser));
            }
            const config = ROLE_CONFIGS[profileUser.role];
            const targetRoute = config ? config.defaultRoute : "/dashboard";
            return { success: true, targetRoute, user: profileUser };
          }
        }
      } catch (err: any) {
        console.error("[Auth] Kesalahan saat login ke Supabase:", err);
      }
    }

    // 3. Fallback graceful ke API client lokal/demo
    const fallbackResult = await api.auth.login(identifier, password);
    if (fallbackResult.success && fallbackResult.user) {
      setUser(fallbackResult.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("sijakon_user_v3", JSON.stringify(fallbackResult.user));
      }
      const config = ROLE_CONFIGS[fallbackResult.user.role];
      const targetRoute = config ? config.defaultRoute : "/";
      return { success: true, targetRoute, user: fallbackResult.user };
    }

    return { 
      success: false, 
      targetRoute: "/login", 
      error: fallbackResult.error || "Pengguna tidak ditemukan. Silakan periksa email atau gunakan akun demo." 
    };
  };

  const logout = async () => {
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("[Auth] Supabase signOut error:", e);
      }
    }

    api.auth.logout();
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sijakon_user_v3");
      localStorage.removeItem("sijakon_user_v2");
      localStorage.removeItem("sijakon_access_token");
      localStorage.removeItem("sijakon_refresh_token");
    }
  };

  const switchUser = (usernameOrRole: string) => {
    const target = DEMO_USERS[usernameOrRole] || Object.values(DEMO_USERS).find((u) => u.role === usernameOrRole);
    if (target) {
      setUser(target);
      if (typeof window !== "undefined") {
        localStorage.setItem("sijakon_user_v3", JSON.stringify(target));
        localStorage.setItem("sijakon_access_token", "demo_jwt_token_" + target.username);
      }
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const supabase = createClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/set-password` : undefined,
        });
        if (error) {
          return { success: false, message: error.message };
        }
        return { 
          success: true, 
          message: "Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk." 
        };
      } catch (err: any) {
        return { success: false, message: err?.message || "Gagal mengirim email reset kata sandi." };
      }
    }

    return {
      success: true,
      message: "[Mode Simulasi Demo] Permintaan reset kata sandi berhasil disimulasikan untuk email " + email,
    };
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
        isSupabase: isSupabaseActive,
        login, 
        logout, 
        switchUser, 
        resetPassword,
        hasRole, 
        hasPermission 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

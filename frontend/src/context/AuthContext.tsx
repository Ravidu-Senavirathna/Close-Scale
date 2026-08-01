/**
 * AuthContext — provides authentication state and actions to the entire app.
 *
 * What it manages:
 *   - currentUser  : profile returned by GET /api/users/me/
 *   - accessToken  : JWT stored in localStorage (for reference — axiosClient reads it directly)
 *   - login()      : POST /api/auth/token/ → stores tokens → loads user profile
 *   - logout()     : blacklists the refresh token → clears localStorage
 *   - isLoading    : true while the initial session is being restored on mount
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosClient from "../api/axiosClient";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "SALES_REP" | "SALES_MANAGER" | "PROJECT_MANAGER" | "CEO" | "ADMIN";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
}

interface AuthContextValue {
  currentUser: CurrentUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch the profile of the current user from the API. */
  const fetchMe = useCallback(async () => {
    try {
      const { data } = await axiosClient.get<CurrentUser>("/api/users/me/");
      setCurrentUser(data);
    } catch {
      // Token is stale / invalid — clear it
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setAccessToken(null);
      setCurrentUser(null);
    }
  }, []);

  /** Restore session on first load if a token already exists in storage. */
  useEffect(() => {
    const stored = localStorage.getItem("access_token");
    if (stored) {
      setAccessToken(stored);
      fetchMe().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  /** POST /api/auth/token/ → store tokens → load profile. */
  const login = useCallback(async (username: string, password: string) => {
    const { data } = await axiosClient.post<{
      access: string;
      refresh: string;
    }>("/api/auth/token/", { username, password });

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    setAccessToken(data.access);
    await fetchMe();
  }, [fetchMe]);

  /** Blacklist the refresh token then clear local state. */
  const logout = useCallback(async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) {
        await axiosClient.post("/api/auth/token/blacklist/", { refresh });
      }
    } catch {
      // Ignore errors — clear client state regardless
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setAccessToken(null);
      setCurrentUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, accessToken, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

/**
 * AuthContext — provides authentication state and actions to the entire app.
 *
 * What it manages:
 *   - currentUser  : profile returned by GET /api/users/me/
 *   - login()      : POST /api/auth/token/ → sets HttpOnly cookies → loads user profile
 *   - logout()     : POST /api/auth/token/blacklist/ → clears HttpOnly cookies
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

export type UserRole = "SALES_REP" | "SALES_MANAGER" | "TECH_LEAD" | "FINANCE_OFFICER" | "ADMIN";

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
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch the profile of the current user from the API. */
  const fetchMe = useCallback(async () => {
    try {
      const { data } = await axiosClient.get<CurrentUser>("/api/users/me/");
      setCurrentUser(data);
    } catch {
      // Cookies might be invalid or missing
      setCurrentUser(null);
    }
  }, []);

  /** Restore session on first load by fetching profile. */
  useEffect(() => {
    fetchMe().finally(() => setIsLoading(false));
  }, [fetchMe]);

  /** POST /api/auth/token/ → stores cookies → load profile. */
  const login = useCallback(async (username: string, password: string) => {
    await axiosClient.post("/api/auth/token/", { username, password });
    await fetchMe();
  }, [fetchMe]);

  /** Blacklist the refresh token (clears cookies) then clear local state. */
  const logout = useCallback(async () => {
    try {
      await axiosClient.post("/api/auth/token/blacklist/");
    } catch {
      // Ignore errors — clear client state regardless
    } finally {
      setCurrentUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoading, login, logout }}
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

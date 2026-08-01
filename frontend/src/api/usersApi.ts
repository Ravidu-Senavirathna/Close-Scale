/**
 * usersApi — typed wrappers around the /api/users/ endpoints.
 *
 * All functions use the shared axiosClient (handles JWT + auto-refresh).
 */

import axiosClient from "./axiosClient";
import type { UserRole } from "../context/AuthContext";

// ── Response shapes ──────────────────────────────────────────────────────────

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserDetail {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserListItem[];
}

// ── Request shapes ───────────────────────────────────────────────────────────

export interface CreateUserPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

// ── API calls ────────────────────────────────────────────────────────────────

/** GET /api/users/ — paginated list of all users (Admin only). */
export async function listUsers(page = 1): Promise<PaginatedUsers> {
  const { data } = await axiosClient.get<PaginatedUsers>("/api/users/", {
    params: { page },
  });
  return data;
}

/** POST /api/users/ — create a new user (Admin only). */
export async function createUser(payload: CreateUserPayload): Promise<UserDetail> {
  const { data } = await axiosClient.post<UserDetail>("/api/users/", payload);
  return data;
}

/** GET /api/users/{id}/ — retrieve a single user (Admin only). */
export async function getUser(id: number): Promise<UserDetail> {
  const { data } = await axiosClient.get<UserDetail>(`/api/users/${id}/`);
  return data;
}

/** PATCH /api/users/{id}/ — partial update (Admin only). */
export async function updateUser(
  id: number,
  payload: UpdateUserPayload
): Promise<UserDetail> {
  const { data } = await axiosClient.patch<UserDetail>(
    `/api/users/${id}/`,
    payload
  );
  return data;
}

/** PATCH /api/users/{id}/deactivate/ — toggle is_active (Admin only). */
export async function toggleUserActive(id: number): Promise<UserDetail> {
  const { data } = await axiosClient.patch<UserDetail>(
    `/api/users/${id}/deactivate/`
  );
  return data;
}

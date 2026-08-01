/**
 * UsersPage — Admin User Management (F1.5)
 *
 * Features:
 *   - Paginated user table (GET /api/users/)
 *   - Search (client-side filter on loaded data)
 *   - Filter by role
 *   - Create user modal (POST /api/users/)
 *   - Edit user modal (PATCH /api/users/{id}/)
 *   - Deactivate / reactivate toggle (PATCH /api/users/{id}/deactivate/)
 *
 * Only accessible to users with role === "ADMIN" (enforced by the route guard
 * in App.tsx via <PrivateRoute allowedRoles={["ADMIN"]} />).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../context/AuthContext";
import {
  listUsers,
  createUser,
  updateUser,
  toggleUserActive,
} from "../../api/usersApi";
import type { UserListItem, CreateUserPayload, UpdateUserPayload } from "../../api/usersApi";
import "./UsersPage.css";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ROLE_LABELS: Record<UserRole, string> = {
  SALES_REP: "Sales Rep",
  SALES_MANAGER: "Sales Manager",
  PROJECT_MANAGER: "Project Manager",
  CEO: "CEO / Director",
  ADMIN: "Administrator",
};

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  ADMIN: "up-badge up-badge--admin",
  SALES_MANAGER: "up-badge up-badge--manager",
  PROJECT_MANAGER: "up-badge up-badge--manager",
  CEO: "up-badge up-badge--ceo",
  SALES_REP: "up-badge up-badge--sales",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractApiError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: unknown } }).response;
    if (res?.data) {
      const data = res.data as Record<string, unknown>;
      return Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join(" · ");
    }
  }
  return "An unexpected error occurred.";
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateUserModal({ onClose, onCreated }: CreateUserModalProps) {
  const [form, setForm] = useState<CreateUserPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "SALES_REP",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createUser(form);
      onCreated();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="up-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="up-modal" role="dialog" aria-modal="true" aria-labelledby="create-modal-title">
        <div className="up-modal__header">
          <h2 className="up-modal__title" id="create-modal-title">Create User</h2>
          <button className="up-modal__close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="up-modal__body">
            {error && <div className="up-modal__error">⚠ {error}</div>}

            <div className="up-form-row">
              <div className="up-form-group">
                <label htmlFor="create-first-name">First Name</label>
                <input
                  id="create-first-name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Jane"
                  disabled={saving}
                />
              </div>
              <div className="up-form-group">
                <label htmlFor="create-last-name">Last Name</label>
                <input
                  id="create-last-name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="up-form-group">
              <label htmlFor="create-username">Username *</label>
              <input
                id="create-username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="janedoe"
                required
                disabled={saving}
              />
            </div>

            <div className="up-form-group">
              <label htmlFor="create-email">Email *</label>
              <input
                id="create-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@altrium.dev"
                required
                disabled={saving}
              />
            </div>

            <div className="up-form-group">
              <label htmlFor="create-role">Role *</label>
              <select
                id="create-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="SALES_REP">Sales Rep</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="CEO">CEO / Director</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="up-form-group">
              <label htmlFor="create-password">Temporary Password *</label>
              <input
                id="create-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="up-modal__footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="btn-spinner" /> : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────

interface EditUserModalProps {
  user: UserListItem;
  onClose: () => void;
  onSaved: () => void;
}

function EditUserModal({ user, onClose, onSaved }: EditUserModalProps) {
  const [form, setForm] = useState<UpdateUserPayload & { role: UserRole }>({
    first_name: "",
    last_name: "",
    role: user.role,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateUser(user.id, form);
      onSaved();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="up-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="up-modal" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
        <div className="up-modal__header">
          <h2 className="up-modal__title" id="edit-modal-title">
            Edit — <span style={{ color: "var(--accent)" }}>{user.full_name || user.username}</span>
          </h2>
          <button className="up-modal__close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="up-modal__body">
            {error && <div className="up-modal__error">⚠ {error}</div>}

            <div className="up-form-row">
              <div className="up-form-group">
                <label htmlFor="edit-first-name">First Name</label>
                <input
                  id="edit-first-name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder={user.full_name?.split(" ")[0] || "—"}
                  disabled={saving}
                />
              </div>
              <div className="up-form-group">
                <label htmlFor="edit-last-name">Last Name</label>
                <input
                  id="edit-last-name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder={user.full_name?.split(" ").slice(1).join(" ") || "—"}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="up-form-group">
              <label htmlFor="edit-role">Role *</label>
              <select
                id="edit-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="SALES_REP">Sales Rep</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="CEO">CEO / Director</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <div className="up-modal__footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="btn-spinner" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<UserListItem | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers(page);
      setAllUsers(data.results);
      setTotalCount(data.count);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  // ── Client-side filter (search + role) ────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allUsers.filter((u) => {
      const matchSearch =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q);
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [allUsers, search, roleFilter]);

  // ── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: totalCount,
    active: allUsers.filter((u) => u.is_active).length,
    inactive: allUsers.filter((u) => !u.is_active).length,
    managers: allUsers.filter((u) => u.role === "SALES_MANAGER" || u.role === "PROJECT_MANAGER").length,
  }), [allUsers, totalCount]);

  // ── Pagination ────────────────────────────────────────────────────────
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Actions ──────────────────────────────────────────────────────────
  async function handleToggleActive(user: UserListItem) {
    setTogglingId(user.id);
    try {
      await toggleUserActive(user.id);
      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch {
      setError("Failed to update user status.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function handleRefresh() {
    fetchUsers(currentPage);
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="up-root">
      {/* ── Nav ── */}
      <nav className="up-nav">
        <div className="up-nav__left">
          <div className="up-nav__logo">
            <span className="up-nav__mark">A</span>
            <span className="up-nav__brand">Altrium CRM</span>
          </div>
          <span className="up-nav__divider" />
          <span className="up-nav__page-title">User Management</span>
        </div>
        <div className="up-nav__user">
          <span className="up-nav__avatar">
            {currentUser?.full_name?.[0]?.toUpperCase() ?? "A"}
          </span>
          <span className="up-nav__username">{currentUser?.full_name || currentUser?.username}</span>
          <button id="nav-logout-btn" className="up-nav__logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="up-main">
        {/* Header */}
        <div className="up-header">
          <div className="up-header__text">
            <h1>User Management</h1>
            <p>Create, edit, and manage system user accounts and roles.</p>
          </div>
          <button
            id="create-user-btn"
            className="btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + New User
          </button>
        </div>

        {/* Stats */}
        <div className="up-stats">
          <div className="up-stat-card">
            <span className="up-stat-card__label">Total Users</span>
            <span className="up-stat-card__value">{stats.total}</span>
          </div>
          <div className="up-stat-card">
            <span className="up-stat-card__label">Active</span>
            <span className="up-stat-card__value active">{stats.active}</span>
          </div>
          <div className="up-stat-card">
            <span className="up-stat-card__label">Inactive</span>
            <span className="up-stat-card__value inactive">{stats.inactive}</span>
          </div>
          <div className="up-stat-card">
            <span className="up-stat-card__label">Managers</span>
            <span className="up-stat-card__value">{stats.managers}</span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="up-error-banner">
            ⚠ {error}
            <button
              style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
              onClick={handleRefresh}
            >
              Retry
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="up-toolbar">
          <div className="up-search">
            <span className="up-search__icon">⌕</span>
            <input
              id="user-search-input"
              className="up-search__input"
              type="text"
              placeholder="Search by name, username or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search users"
            />
          </div>
          <select
            id="role-filter-select"
            className="up-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
            aria-label="Filter by role"
          >
            <option value="ALL">All Roles</option>
            <option value="SALES_REP">Sales Rep</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="CEO">CEO / Director</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        {/* Table */}
        <div className="up-table-wrap">
          {loading ? (
            <div className="up-loading">
              <span className="up-spinner" />
              Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div className="up-empty">
              <div className="up-empty__icon">👤</div>
              <p className="up-empty__text">
                {search || roleFilter !== "ALL"
                  ? "No users match your search."
                  : "No users found. Create the first one!"}
              </p>
            </div>
          ) : (
            <table className="up-table" aria-label="Users table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    {/* User */}
                    <td>
                      <div className="up-cell-user">
                        <div className="up-cell-avatar">
                          {(user.full_name?.[0] || user.username?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <div className="up-cell-user__name">
                            {user.full_name || "—"}
                          </div>
                          <div className="up-cell-user__username">@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {user.email || "—"}
                    </td>

                    {/* Role */}
                    <td>
                      <span className={ROLE_BADGE_CLASS[user.role]}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`up-status ${user.is_active ? "up-status--active" : "up-status--inactive"}`}>
                        <span className="up-status__dot" />
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="up-actions">
                        <button
                          id={`edit-user-${user.id}-btn`}
                          className="up-action-btn"
                          onClick={() => setEditTarget(user)}
                          disabled={togglingId === user.id}
                        >
                          Edit
                        </button>
                        <button
                          id={`toggle-user-${user.id}-btn`}
                          className={`up-action-btn ${user.is_active ? "up-action-btn--danger" : "up-action-btn--success"}`}
                          onClick={() => handleToggleActive(user)}
                          disabled={togglingId === user.id || user.id === currentUser?.id}
                          title={user.id === currentUser?.id ? "You cannot deactivate your own account" : undefined}
                        >
                          {togglingId === user.id ? (
                            <span className="btn-spinner" style={{ borderTopColor: "currentColor" }} />
                          ) : user.is_active ? (
                            "Deactivate"
                          ) : (
                            "Reactivate"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="up-pagination">
              <span className="up-pagination__info">
                Showing {allUsers.length} of {totalCount} users
              </span>
              <div className="up-pagination__controls">
                <button
                  id="pagination-prev-btn"
                  className="up-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    id={`pagination-page-${page}-btn`}
                    className={`up-page-btn ${page === currentPage ? "up-page-btn--active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  id="pagination-next-btn"
                  className="up-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchUsers(currentPage);
          }}
        />
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            fetchUsers(currentPage);
          }}
        />
      )}
    </div>
  );
}

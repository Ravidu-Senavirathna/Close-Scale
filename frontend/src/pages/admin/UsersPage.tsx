import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../context/AuthContext";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser
} from "../../api/usersApi";
import type {
  UserListItem,
  CreateUserPayload,
  UpdateUserPayload
} from "../../api/usersApi";
import "./UsersPage.css";

// ── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  SALES_REP: "Sales Rep",
  SALES_MANAGER: "Sales Manager",
  TECH_LEAD: "Tech Lead",
  FINANCE_OFFICER: "Finance Officer",
  ADMIN: "Admin",
};

// Map roles to CSS classes for avatar/badge colors
const ROLE_COLOR_CLASS: Record<UserRole, string> = {
  ADMIN: "ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  TECH_LEAD: "TECH_LEAD",
  FINANCE_OFFICER: "FINANCE_OFFICER",
  SALES_REP: "SALES_REP",
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
    phone_number: "",
    role: "SALES_REP",
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
      <div className="up-modal" role="dialog" aria-modal="true">
        <div className="up-modal__header">
          <h2 className="up-modal__title">Create User</h2>
          <button className="up-modal__close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="up-modal__body">
            {error && <div className="up-modal__error">⚠ {error}</div>}

            <div className="up-form-row">
              <div className="up-form-group">
                <label>First Name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} disabled={saving} />
              </div>
              <div className="up-form-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} disabled={saving} />
              </div>
            </div>

            <div className="up-form-group">
              <label>Username *</label>
              <input name="username" value={form.username} onChange={handleChange} required disabled={saving} />
            </div>

            <div className="up-form-group">
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={saving} />
            </div>

            <div className="up-form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone_number" value={form.phone_number || ""} onChange={handleChange} disabled={saving} />
            </div>

            <div className="up-form-group">
              <label>Role *</label>
              <select name="role" value={form.role} onChange={handleChange} required disabled={saving}>
                <option value="SALES_REP">Sales Rep</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="TECH_LEAD">Tech Lead</option>
                <option value="FINANCE_OFFICER">Finance Officer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

          </div>

          <div className="up-modal__footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditUserModalProps {
  user: UserListItem;
  onClose: () => void;
  onSaved: () => void;
  onDelete: (user: UserListItem) => Promise<void>;
  currentUserId: number | undefined;
}

function EditUserModal({ user, onClose, onSaved, onDelete, currentUserId }: EditUserModalProps) {
  const [form, setForm] = useState<UpdateUserPayload & { role: UserRole, is_active: boolean }>({
    first_name: "",
    last_name: "",
    email: user.email,
    phone_number: user.phone_number || "",
    role: user.role,
    is_active: user.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
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
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to completely delete ${user.full_name || user.username}? This cannot be undone.`)) {
      return;
    }
    setToggling(true);
    setError(null);
    try {
      await onDelete(user);
      onSaved();
    } catch (err) {
      setError("Failed to delete user");
      setToggling(false);
    }
  }

  return (
    <div className="up-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="up-modal" role="dialog" aria-modal="true">
        <div className="up-modal__header">
          <h2 className="up-modal__title">Edit User — {user.full_name || user.username}</h2>
          <button className="up-modal__close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="up-modal__body">
            {error && <div className="up-modal__error">⚠ {error}</div>}

            <div className="up-form-row">
              <div className="up-form-group">
                <label>First Name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} placeholder={user.full_name?.split(" ")[0] || ""} disabled={saving} />
              </div>
              <div className="up-form-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} placeholder={user.full_name?.split(" ").slice(1).join(" ") || ""} disabled={saving} />
              </div>
            </div>

            <div className="up-form-group">
              <label>Username</label>
              <input type="text" name="username" value={user.username} disabled={true} />
            </div>

            <div className="up-form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email || ""} onChange={handleChange} required disabled={saving} />
            </div>

            <div className="up-form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone_number" value={form.phone_number || ""} onChange={handleChange} disabled={saving} />
            </div>

            <div className="up-form-group">
              <label>Role *</label>
              <select name="role" value={form.role} onChange={handleChange} required disabled={saving}>
                <option value="SALES_REP">Sales Rep</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="TECH_LEAD">Tech Lead</option>
                <option value="FINANCE_OFFICER">Finance Officer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>


          </div>

          <div className="up-modal__footer" style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ color: "var(--palette-error)" }}
                onClick={handleDelete}
                disabled={saving || toggling || user.id === currentUserId}
              >
                Delete
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                disabled={saving || toggling || user.id === currentUserId}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {form.is_active ? (
                  <>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--palette-brand-green)' }} />
                    Active
                  </>
                ) : (
                  <>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--palette-text-secondary)' }} />
                    Inactive
                  </>
                )}
              </button>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={saving || toggling}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving || toggling}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { currentUser } = useAuth();

  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<UserListItem | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await listUsers(1); // just get first page for now
      setAllUsers(data.results);
      setTotalCount(data.count);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (user: UserListItem) => {
    await deleteUser(user.id);
  };

  const getInitials = (name: string, username: string) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };



  return (
    <div className="up-root">
      <main className="up-main">
        
        {/* Header */}
        <div className="up-header">
          <div className="up-header__text">
            <h1>User Management</h1>
            <p>{totalCount} registered users</p>
          </div>
          <button className="btn-create-user" onClick={() => setShowCreate(true)}>
            + Create User
          </button>
        </div>

        {/* Grid */}
        <div className="users-grid">
          {allUsers.map((user) => (
            <div key={user.id} className="user-card" onClick={() => setEditTarget(user)}>
              <div className="user-card-left">
                <div className={`user-avatar avatar-${ROLE_COLOR_CLASS[user.role] || 'default'}`}>
                  {getInitials(user.full_name, user.username)}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.full_name || user.username}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <div className="user-card-right">
                <div className={`role-badge badge-${ROLE_COLOR_CLASS[user.role] || 'default'}`}>
                  {ROLE_LABELS[user.role] || user.role}
                </div>
                <div className={`user-status ${user.is_active ? 'active' : 'inactive'}`}>
                  <div className="status-dot"></div>
                  {user.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchUsers();
          }}
        />
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          currentUserId={currentUser?.id}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            fetchUsers();
          }}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
}

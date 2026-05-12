import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Dashboard.css";

// ── tiny helpers ─────────────────────────────────────────────────
function initials(name) {
  return (name || "?")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidPassword(v) {
  return v.length >= 6 && /[@]/.test(v) && /[A-Z]/.test(v);
}

const ROLE_LABEL = { superadmin: "Super Admin", admin: "Admin", user: "User" };

function avClass(role) {
  return role === "superadmin" ? "av-sa" : role === "admin" ? "av-ad" : "av-us";
}

function rbClass(role) {
  return "role-badge rb-" + role;
}

// ── seed demo data if needed ──────────────────────────────────────
function seedIfEmpty() {
  const existing = JSON.parse(localStorage.getItem("nx_users") || "[]");
  if (existing.length > 0) return;

  const demo = [
    { id: "sa1", firstName: "Sarah", lastName: "Chen",  name: "Sarah Chen",  email: "sa@demo.com",    password: "Admin@1",  role: "superadmin", phone: "+1 415 111 0001", dept: "Executive",   address: "101 Market St, SF",       createdBy: null },
    { id: "ad1", firstName: "Marco", lastName: "Rossi", name: "Marco Rossi", email: "admin@demo.com", password: "Admin@1",  role: "admin",      phone: "+1 312 222 0001", dept: "Operations",  address: "55 Wacker Dr, Chicago",    createdBy: "sa1" },
    { id: "us1", firstName: "James", lastName: "Liu",   name: "James Liu",   email: "user@demo.com",  password: "Admin@1",  role: "user",       phone: "+1 650 333 0001", dept: "Engineering", address: "1 Infinite Loop, Cupertino", createdBy: "ad1" },
  ];
  localStorage.setItem("nx_users", JSON.stringify(demo));
}

// ── icons (inline svg, no dependency) ────────────────────────────
const Icon = {
  grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  crown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17l2-7 5 4 2-7 2 7 5-4 2 7H3z"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ── MODAL ────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>{Icon.x}</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── VIEW PROFILE MODAL ───────────────────────────────────────────
function ViewProfileModal({ user, onClose, onEdit, currentUser }) {
  const creator = (() => {
    if (!user.createdBy) return null;
    const all = JSON.parse(localStorage.getItem("nx_users") || "[]");
    return all.find((u) => u.id === user.createdBy);
  })();

  const canEdit =
    currentUser.id === user.id ||
    (currentUser.role === "admin" && user.role === "user") ||
    currentUser.role === "superadmin";

  return (
    <Modal
      title="Profile"
      onClose={onClose}
      footer={
        <>
          {canEdit && (
            <button className="btn btn-primary btn-sm" onClick={() => onEdit(user)}>
              {Icon.edit} Edit
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </>
      }
    >
      <div className="profile-header">
        <div className={`avatar profile-avatar ${avClass(user.role)}`}>
          {initials(user.name)}
        </div>
        <div>
          <p className="profile-name">{user.name}</p>
          <span className={rbClass(user.role)}>{ROLE_LABEL[user.role]}</span>
        </div>
      </div>
      <div className="info-grid">
        <div>
          <p className="info-field-label">Email</p>
          <p className="info-field-val">{user.email}</p>
        </div>
        <div>
          <p className="info-field-label">Phone</p>
          <p className="info-field-val">{user.phone || "—"}</p>
        </div>
        <div>
          <p className="info-field-label">Department</p>
          <p className="info-field-val">{user.dept || "—"}</p>
        </div>
        <div>
          <p className="info-field-label">Address</p>
          <p className="info-field-val">{user.address || "—"}</p>
        </div>
        {creator && (
          <div>
            <p className="info-field-label">Created by</p>
            <p className="info-field-val">{creator.name}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── EDIT PROFILE MODAL ───────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    dept: user.dept || "",
    address: user.address || "",
  });
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErr("First and last name are required"); return;
    }
    if (!isValidEmail(form.email)) { setErr("Invalid email"); return; }
    onSave({ ...user, ...form, name: `${form.firstName} ${form.lastName}` });
  };

  return (
    <Modal
      title="Edit profile"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-primary" onClick={save}>{Icon.check} Save</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </>
      }
    >
      {err && <p className="auth-error" style={{ marginBottom: 14 }}>{err}</p>}
      <div className="modal-form-row" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">First name</label>
          <input className="form-input" value={form.firstName} onChange={set("firstName")} />
        </div>
        <div>
          <label className="form-label">Last name</label>
          <input className="form-input" value={form.lastName} onChange={set("lastName")} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Email</label>
        <input className="form-input" value={form.email} onChange={set("email")} />
      </div>
      <div className="modal-form-row" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="form-label">Department</label>
          <input className="form-input" value={form.dept} onChange={set("dept")} />
        </div>
      </div>
      <div>
        <label className="form-label">Address</label>
        <input className="form-input" value={form.address} onChange={set("address")} />
      </div>
    </Modal>
  );
}

// ── CREATE USER MODAL ────────────────────────────────────────────
function CreateUserModal({ role, currentUser, onClose, onCreated }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dept: "", address: "", password: "", rePass: ""
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const submit = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!isValidEmail(form.email)) e.email = "Invalid email";
    if (!isValidPassword(form.password)) {
      e.password = form.password.length < 6
        ? "Min 6 characters"
        : !/@/.test(form.password) ? "Must include @"
        : "Must include uppercase";
    }
    if (form.password !== form.rePass) e.rePass = "Passwords don't match";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const all = JSON.parse(localStorage.getItem("nx_users") || "[]");
    if (all.find((u) => u.email === form.email)) {
      setErrors({ email: "Email already registered" }); return;
    }

    const newUser = {
      id: uid(),
      firstName: form.firstName,
      lastName: form.lastName,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      password: form.password,
      phone: form.phone,
      dept: form.dept,
      address: form.address,
      role,
      createdBy: currentUser.id,
    };
    all.push(newUser);
    localStorage.setItem("nx_users", JSON.stringify(all));
    onCreated();
  };

  return (
    <Modal
      title={`Create ${ROLE_LABEL[role]}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-primary" onClick={submit}>{Icon.plus} Create</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </>
      }
    >
      <div className="modal-form-row" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">First name</label>
          <input className={`form-input ${errors.firstName ? "error-input" : ""}`} value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
          {errors.firstName && <p className="field-error">⚠ {errors.firstName}</p>}
        </div>
        <div>
          <label className="form-label">Last name</label>
          <input className={`form-input ${errors.lastName ? "error-input" : ""}`} value={form.lastName} onChange={set("lastName")} placeholder="Smith" />
          {errors.lastName && <p className="field-error">⚠ {errors.lastName}</p>}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Email</label>
        <input className={`form-input ${errors.email ? "error-input" : ""}`} value={form.email} onChange={set("email")} placeholder="jane@company.com" />
        {errors.email && <p className="field-error">⚠ {errors.email}</p>}
      </div>
      <div className="modal-form-row" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={set("phone")} placeholder="+1 000 000 0000" />
        </div>
        <div>
          <label className="form-label">Department</label>
          <input className="form-input" value={form.dept} onChange={set("dept")} placeholder="Engineering" />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Address</label>
        <input className="form-input" value={form.address} onChange={set("address")} placeholder="123 Main St" />
      </div>
      <div className="modal-form-row">
        <div>
          <label className="form-label">Password</label>
          <input type="password" className={`form-input ${errors.password ? "error-input" : ""}`} value={form.password} onChange={set("password")} placeholder="Min 6 · @ · uppercase" />
          {errors.password && <p className="field-error">⚠ {errors.password}</p>}
        </div>
        <div>
          <label className="form-label">Confirm password</label>
          <input type="password" className={`form-input ${errors.rePass ? "error-input" : ""}`} value={form.rePass} onChange={set("rePass")} placeholder="Re-enter" />
          {errors.rePass && <p className="field-error">⚠ {errors.rePass}</p>}
        </div>
      </div>
    </Modal>
  );
}

// ── USER TABLE PAGE ──────────────────────────────────────────────
function UserListPage({ role, currentUser, onRefresh }) {
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [creating, setCreating] = useState(false);

  const allUsers = JSON.parse(localStorage.getItem("nx_users") || "[]");
  const list = allUsers
    .filter((u) => u.role === role)
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.dept || "").toLowerCase().includes(q)
      );
    });

  const canCreate =
    (role === "user" && (currentUser.role === "admin" || currentUser.role === "superadmin")) ||
    (role === "admin" && currentUser.role === "superadmin") ||
    (role === "superadmin" && currentUser.role === "superadmin");

  const canDelete = canCreate;

  const deleteUser = (id) => {
    if (!window.confirm("Delete this member?")) return;
    const updated = allUsers.filter((u) => u.id !== id);
    localStorage.setItem("nx_users", JSON.stringify(updated));
    onRefresh();
  };

  const saveEdit = (updated) => {
    const updated_list = allUsers.map((u) => (u.id === updated.id ? updated : u));
    localStorage.setItem("nx_users", JSON.stringify(updated_list));
    // if editing self, update current
    const curr = JSON.parse(localStorage.getItem("nx_current") || "null");
    if (curr && curr.id === updated.id) {
      localStorage.setItem("nx_current", JSON.stringify(updated));
    }
    setEditUser(null);
    setViewUser(null);
    onRefresh();
  };

  const creatorName = (createdBy) => {
    const c = allUsers.find((u) => u.id === createdBy);
    return c ? c.name : "—";
  };

  return (
    <div>
      {viewUser && !editUser && (
        <ViewProfileModal
          user={viewUser}
          currentUser={currentUser}
          onClose={() => setViewUser(null)}
          onEdit={(u) => { setViewUser(null); setEditUser(u); }}
        />
      )}
      {editUser && (
        <EditProfileModal user={editUser} onClose={() => setEditUser(null)} onSave={saveEdit} />
      )}
      {creating && (
        <CreateUserModal
          role={role}
          currentUser={currentUser}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); onRefresh(); }}
        />
      )}

      <div className="table-card">
        <div className="table-head">
          <span className="table-head-title">
            {list.length} {ROLE_LABEL[role]}{list.length !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="table-search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {canCreate && (
              <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
                {Icon.plus} New {ROLE_LABEL[role]}
              </button>
            )}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No {ROLE_LABEL[role].toLowerCase()}s found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Created by</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="cell-user">
                      <div className={`avatar ${avClass(u.role)}`}>{initials(u.name)}</div>
                      {u.name}
                    </div>
                  </td>
                  <td className="cell-muted">{u.email}</td>
                  <td className="cell-muted">{u.dept || "—"}</td>
                  <td className="cell-muted">{creatorName(u.createdBy)}</td>
                  <td>
                    <div className="actions-group">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewUser(u)}>
                        {Icon.eye} View
                      </button>
                      {canDelete && u.id !== currentUser.id && (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                          {Icon.trash}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD HOME PAGE ──────────────────────────────────────────
function DashboardHome({ currentUser }) {
  const allUsers = JSON.parse(localStorage.getItem("nx_users") || "[]");
  const counts = {
    superadmin: allUsers.filter((u) => u.role === "superadmin").length,
    admin: allUsers.filter((u) => u.role === "admin").length,
    user: allUsers.filter((u) => u.role === "user").length,
  };

  const r = currentUser.role;

  const accessPills =
    r === "superadmin" ? (
      <>
        <span className="ap ap-view">View all</span>
        <span className="ap ap-create">Create Admins & Users</span>
        <span className="ap ap-manage">Full access</span>
      </>
    ) : r === "admin" ? (
      <>
        <span className="ap ap-view">View Users & Admins</span>
        <span className="ap ap-create">Create Users</span>
      </>
    ) : (
      <span className="ap ap-view">View own profile</span>
    );

  const visible = allUsers.filter((u) => {
    if (r === "superadmin") return true;
    if (r === "admin") return u.role === "user" || u.role === "admin";
    return u.id === currentUser.id;
  });

  return (
    <div>
      <div className="welcome-banner">
        <div className="welcome-emoji">👋</div>
        <div>
          <p className="welcome-title">Welcome back, {currentUser.firstName || currentUser.name.split(" ")[0]}</p>
          <p className="welcome-sub">
            Signed in as <strong>{ROLE_LABEL[r]}</strong>
          </p>
          <div className="access-pills">{accessPills}</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total members</p>
          <p className="stat-value" style={{ color: "var(--accent)" }}>
            {allUsers.length}
          </p>
          <p className="stat-sub">across all roles</p>
        </div>
        {r === "superadmin" && (
          <div className="stat-card">
            <p className="stat-label">Super Admins</p>
            <p className="stat-value" style={{ color: "#a78bfa" }}>{counts.superadmin}</p>
            <p className="stat-sub">full access</p>
          </div>
        )}
        {(r === "superadmin" || r === "admin") && (
          <div className="stat-card">
            <p className="stat-label">Admins</p>
            <p className="stat-value" style={{ color: "var(--amber)" }}>{counts.admin}</p>
            <p className="stat-sub">manage users</p>
          </div>
        )}
        <div className="stat-card">
          <p className="stat-label">Users</p>
          <p className="stat-value" style={{ color: "var(--green)" }}>{counts.user}</p>
          <p className="stat-sub">standard access</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-head">
          <span className="table-head-title">Recent members</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {visible.slice(0, 6).map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="cell-user">
                    <div className={`avatar ${avClass(u.role)}`}>{initials(u.name)}</div>
                    {u.name}
                  </div>
                </td>
                <td>
                  <span className={rbClass(u.role)}>{ROLE_LABEL[u.role]}</span>
                </td>
                <td className="cell-muted">{u.dept || "—"}</td>
                <td className="cell-muted">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MY PROFILE PAGE ──────────────────────────────────────────────
function MyProfilePage({ currentUser, onRefresh }) {
  const [editing, setEditing] = useState(false);

  const saveEdit = (updated) => {
    const all = JSON.parse(localStorage.getItem("nx_users") || "[]");
    const updated_list = all.map((u) => (u.id === updated.id ? updated : u));
    localStorage.setItem("nx_users", JSON.stringify(updated_list));
    localStorage.setItem("nx_current", JSON.stringify(updated));
    setEditing(false);
    onRefresh();
  };

  return (
    <div style={{ maxWidth: 500 }}>
      {editing && (
        <EditProfileModal user={currentUser} onClose={() => setEditing(false)} onSave={saveEdit} />
      )}
      <div className="table-card" style={{ padding: 22 }}>
        <div className="profile-header">
          <div className={`avatar profile-avatar ${avClass(currentUser.role)}`} style={{ width: 58, height: 58, fontSize: 20 }}>
            {initials(currentUser.name)}
          </div>
          <div>
            <p className="profile-name">{currentUser.name}</p>
            <span className={rbClass(currentUser.role)}>{ROLE_LABEL[currentUser.role]}</span>
          </div>
        </div>
        <div className="info-grid">
          {[
            ["Email", currentUser.email],
            ["Phone", currentUser.phone || "—"],
            ["Department", currentUser.dept || "—"],
            ["Address", currentUser.address || "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="info-field-label">{label}</p>
              <p className="info-field-val">{val}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
            {Icon.edit} Edit profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PERMISSIONS PAGE ─────────────────────────────────────────────
function PermissionsPage() {
  const rows = [
    ["View own profile",   true, true, true],
    ["View users",         true, true, false],
    ["Create users",       true, true, false],
    ["Delete users",       true, true, false],
    ["View admins",        true, true, false],
    ["Create admins",      true, false, false],
    ["Delete admins",      true, false, false],
    ["View super admins",  true, false, false],
    ["Create super admins",false, false, false],
  ];

  return (
    <div className="table-card" style={{ maxWidth: 600 }}>
      <div className="table-head">
        <span className="table-head-title">Permission matrix</span>
      </div>
      <table className="perm-table">
        <thead>
          <tr>
            <th>Permission</th>
            <th>Super Admin</th>
            <th>Admin</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, sa, ad, us]) => (
            <tr key={label}>
              <td style={{ color: "var(--text)" }}>{label}</td>
              {[sa, ad, us].map((v, i) => (
                <td key={i} className={v ? "perm-yes" : "perm-no"}>
                  {v ? "✓" : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [tick, setTick] = useState(0);  // force re-render on data change
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    const stored = JSON.parse(localStorage.getItem("nx_current") || "null");
    if (!stored) { navigate("/"); return; }
    setCurrentUser(stored);
  }, [tick]);

  if (!currentUser) return null;

  const refresh = () => {
    const stored = JSON.parse(localStorage.getItem("nx_current") || "null");
    if (stored) setCurrentUser(stored);
    setTick((t) => t + 1);
  };

  const logout = () => {
    localStorage.removeItem("nx_current");
    navigate("/");
  };

  const r = currentUser.role;
  const allUsers = JSON.parse(localStorage.getItem("nx_users") || "[]");

  const navItems = [
    { id: "dashboard", icon: Icon.grid,   label: "Dashboard" },
    { id: "my-profile",icon: Icon.user,   label: "My Profile" },
    ...(r === "admin" || r === "superadmin"
      ? [{ id: "users", icon: Icon.users, label: "Users",
           badge: allUsers.filter((u) => u.role === "user").length }]
      : []),
    ...(r === "admin" || r === "superadmin"
      ? [{ id: "admins", icon: Icon.shield, label: "Admins",
           badge: allUsers.filter((u) => u.role === "admin").length }]
      : []),
    ...(r === "superadmin"
      ? [{ id: "superadmins", icon: Icon.crown, label: "Super Admins",
           badge: allUsers.filter((u) => u.role === "superadmin").length }]
      : []),
    { id: "permissions", icon: Icon.lock, label: "Permissions" },
  ];

  const pageTitles = {
    dashboard: "Dashboard",
    "my-profile": "My Profile",
    users: "Users",
    admins: "Admins",
    superadmins: "Super Admins",
    permissions: "Permissions",
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Sidebar overlay on mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-box">N</div>
          <span className="logo-name">NexAdmin</span>
        </div>

        <div className="nav-section-label">Navigation</div>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => { setPage(item.id); closeSidebar(); }}
          >
            {item.icon}
            {item.label}
            {item.badge != null && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}

        <div className="sidebar-footer">
          <div className="user-chip" onClick={() => { setPage("my-profile"); closeSidebar(); }}>
            <div className={`avatar ${avClass(currentUser.role)}`}>
              {initials(currentUser.name)}
            </div>
            <div className="user-chip-info">
              <p className="user-chip-name">{currentUser.name}</p>
              <p className="user-chip-role">{ROLE_LABEL[currentUser.role]}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            {Icon.logout} Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        <div className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen((o) => !o)}>
            {Icon.menu}
          </button>
          <span className="topbar-title">{pageTitles[page]}</span>
        </div>

        <div className="page-content">
          {page === "dashboard" && (
            <DashboardHome currentUser={currentUser} key={tick} />
          )}
          {page === "my-profile" && (
            <MyProfilePage currentUser={currentUser} onRefresh={refresh} key={tick} />
          )}
          {page === "users" && (
            <UserListPage role="user" currentUser={currentUser} onRefresh={refresh} key={tick} />
          )}
          {page === "admins" && (
            <UserListPage role="admin" currentUser={currentUser} onRefresh={refresh} key={tick} />
          )}
          {page === "superadmins" && (
            <UserListPage role="superadmin" currentUser={currentUser} onRefresh={refresh} key={tick} />
          )}
          {page === "permissions" && <PermissionsPage />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

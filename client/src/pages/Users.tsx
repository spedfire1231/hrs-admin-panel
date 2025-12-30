import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext"; // якщо ще нема

type Profile = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "hr" | "viewer";
  created_at: string;
};

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Profile["role"]>("viewer");
  const [name, setName] = useState("");

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers((data || []) as Profile[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

   const { session } = useAuth();

async function createUser() {
  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  const res = await fetch(
    "https://eyijtbrawiawwufrcutf.supabase.co/functions/v1/create-user",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        email,
        password,
        role,
        name,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    alert("Create user failed: " + text);
    return;
  }

  setOpen(false);
  setEmail("");
  setPassword("");
  setName("");
  setRole("viewer");

  fetchUsers();
}

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-subtitle">Manage HRS users and roles</div>
        </div>

        <button className="cy-btn primary" onClick={() => setOpen(true)}>
          + New User
        </button>
      </div>

      <div className="cy-card pad">
        {loading ? (
          "Loading..."
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="user-email">{u.email}</div>
                        <div className="page-subtitle">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`ui-badge role-${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="cy-modal-overlay" onClick={() => setOpen(false)}>
          <div className="cy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cy-modal-header">
              <div className="cy-modal-title">Create User</div>
            </div>

            <div className="cy-modal-body">
              <div className="cy-grid">
                <input
                  className="cy-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="cy-input"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  className="cy-input"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <select
                  className="cy-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="cy-modal-footer">
              <button className="cy-btn ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="cy-btn primary" onClick={createUser}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
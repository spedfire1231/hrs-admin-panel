import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiHelpCircle,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

type MenuItem = {
  path: string;
  label: string;
  icon: JSX.Element;
  roles: Array<"admin" | "hr" | "viewer">;
};

const menuItems: MenuItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: <FiHome />,
    roles: ["admin", "hr", "viewer"],
  },
  {
    path: "/users",
    label: "Users",
    icon: <FiUsers />,
    roles: ["admin"],
  },
  {
    path: "/scripts",
    label: "Scripts",
    icon: <FiFileText />,
    roles: ["admin", "hr"],
  },
  {
    path: "/faq",
    label: "FAQ",
    icon: <FiHelpCircle />,
    roles: ["admin", "hr"],
  },
  {
    path: "/questions",
    label: "Questions",
    icon: <FiMessageSquare />,
    roles: ["admin", "hr"],
  },
  {
    path: "/settings",
    label: "Settings",
    icon: <FiSettings />,
    roles: ["admin"],
  },
];

const Layout = () => {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      {/* ---------- SIDEBAR ---------- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>HRS Panel</h2>
          <span className="role">{role}</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems
            .filter((item) => role && item.roles.includes(role))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          Logout
        </button>
      </aside>

      {/* ---------- CONTENT ---------- */}
      <main className="main-content">
        <header className="topbar">
          <span>{user?.email}</span>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
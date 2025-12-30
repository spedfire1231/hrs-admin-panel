import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

// pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Scripts from "./pages/Scripts";
import FAQ from "./pages/FAQ";
import Questions from "./pages/Questions";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* ---------- PUBLIC ---------- */}
          <Route path="/login" element={<Login />} />

          {/* ---------- PROTECTED ---------- */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />

              {/* admin only */}
              <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* admin + hr */}
              <Route element={<PrivateRoute allowedRoles={["admin", "hr"]} />}>
                <Route path="/scripts" element={<Scripts />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/questions" element={<Questions />} />
              </Route>
            </Route>
          </Route>

          {/* ---------- FALLBACK ---------- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
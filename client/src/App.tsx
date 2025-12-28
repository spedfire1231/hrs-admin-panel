import React from "react";
import { Routes, Route } from "react-router-dom";

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
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/scripts" element={<Scripts />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

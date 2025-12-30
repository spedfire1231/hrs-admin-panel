import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/"); // або /dashboard
    } catch (err: any) {
      setError(err.message || "Помилка входу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#e5e7eb",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 360,
          padding: 24,
          borderRadius: 12,
          background: "#020617",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        <h2 style={{ fontSize: 22, marginBottom: 16, textAlign: "center" }}>
          HRS WEB Login
        </h2>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#fecaca",
              padding: "8px 12px",
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 14 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              height: 40,
              marginTop: 4,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              color: "#e5e7eb",
              padding: "0 12px",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              height: 40,
              marginTop: 4,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              color: "#e5e7eb",
              padding: "0 12px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: 42,
            borderRadius: 10,
            border: "none",
            background: loading ? "#475569" : "#22d3ee",
            color: "#020617",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Вхід..." : "Увійти"}
        </button>
      </form>
    </div>
  );
};

export default Login;
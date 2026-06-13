import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Store session token
      localStorage.setItem("adminSessionToken", data.sessionToken);

      // Redirect to dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>Memorify Client Gallery Admin</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
          © 2025 Memorify. All rights reserved.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0d0b08 0%, #1a1612 100%)",
    padding: "20px",
    fontFamily: "var(--ff-body, 'Outfit', sans-serif)",
  },
  loginBox: {
    background: "#1a1612",
    border: "1px solid rgba(184, 134, 11, 0.2)",
    borderRadius: "8px",
    padding: "48px 32px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#f0e8d8",
    margin: "0 0 8px",
    letterSpacing: "0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "rgba(240, 232, 216, 0.5)",
    margin: "0 0 32px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#f0e8d8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid rgba(184, 134, 11, 0.3)",
    borderRadius: "4px",
    background: "rgba(255, 255, 255, 0.02)",
    color: "#f0e8d8",
    outline: "none",
    transition: "border-color 0.3s, background 0.3s",
    fontFamily: "inherit",
  },
  button: {
    padding: "12px 24px",
    background: "var(--gold, #b8860b)",
    color: "#0d0b08",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "background 0.3s",
    marginTop: "12px",
  },
  errorBox: {
    padding: "12px 16px",
    background: "rgba(220, 38, 38, 0.1)",
    border: "1px solid rgba(220, 38, 38, 0.3)",
    borderRadius: "4px",
    color: "#fca5a5",
    fontSize: "13px",
    letterSpacing: "0.5px",
  },
  footer: {
    marginTop: "32px",
    textAlign: "center",
    fontSize: "12px",
    color: "rgba(240, 232, 216, 0.3)",
  },
};

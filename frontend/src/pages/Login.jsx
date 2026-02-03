import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

/* ✅ Render Backend */
const API = "https://social-app-backend-b6dw.onrender.com";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Check username/email or password");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home");
    } catch (err) {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <h1 className="brand">VARANASIX</h1>
      <p className="tagline">Connect • Share • Feel</p>

      <form onSubmit={handleLogin} className="login-box">
        <input
          placeholder="Username or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="link-text">
          Don’t have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

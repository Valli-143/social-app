import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

/* ✅ Render Backend API */
const API = "https://social-app-backend-b6dw.onrender.com";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [suggestions, setSuggestions] = useState([]); // ✅ FIX (MISSING STATE)

  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [match, setMatch] = useState(false);

  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ================= PASSWORD MATCH ================= */
  useEffect(() => {
    setMatch(password && rePassword && password === rePassword);
  }, [password, rePassword]);

  /* ================= USERNAME CHECK ================= */
  useEffect(() => {
    if (!username) {
      setUsernameStatus("");
      setSuggestions([]);
      return;
    }

    fetch(`${API}/api/profile/${username}`)
      .then(res => {
        if (res.ok) {
          setUsernameStatus("exists");
          generateSuggestions(username);
        } else {
          setUsernameStatus("available");
          setSuggestions([]);
        }
      })
      .catch(() => {
        setUsernameStatus("available");
        setSuggestions([]);
      });
  }, [username]);

  /* ================= USERNAME SUGGESTIONS ================= */
  function generateSuggestions(base) {
    setSuggestions([
      `${base}_${Math.floor(Math.random() * 100)}`,
      `${base}_${Math.floor(Math.random() * 1000)}`,
      `${base}${Math.floor(Math.random() * 999)}`,
    ]);
  }

  /* ================= SEND OTP ================= */
  async function sendOtp() {
    if (!email) return alert("Enter email first");

    const res = await fetch(`${API}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert("📧 OTP sent to email");
    setOtpSent(true);
  }

  /* ================= VERIFY OTP ================= */
  async function verifyOtp() {
    const res = await fetch(`${API}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert("✅ Email verified");
    setOtpVerified(true);
  }

  /* ================= REGISTER ================= */
  async function handleRegister(e) {
    e.preventDefault();

    if (usernameStatus === "exists") {
      alert("Choose a unique username");
      return;
    }

    if (!match) {
      alert("Passwords do not match");
      return;
    }

    if (!gender) {
      alert("Gender is required");
      return;
    }

    if (email && !otpVerified) {
      alert("Please verify email OTP");
      return;
    }

    setLoading(true);

    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        email,
        gender,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      setLoading(false);
      return;
    }

    alert("🎉 Account created successfully");
    navigate("/login");
  }

  return (
    <div className="register-page">
      <h1 className="brand">VARANASIX</h1>

      <form className="register-box" onSubmit={handleRegister}>
        {/* USERNAME */}
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value.toLowerCase())}
          required
        />

        {usernameStatus === "exists" && (
          <>
            <p className="error">❌ Username exists</p>
            <div className="suggestions">
              {suggestions.map(s => (
                <span
                  key={s}
                  onClick={() => {
                    setUsername(s);
                    setUsernameStatus("available");
                    setSuggestions([]);
                  }}
                >
                  @{s}
                </span>
              ))}
            </div>
          </>
        )}

        {usernameStatus === "available" && username && (
          <p className="success">✔ Username available</p>
        )}

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Re-enter Password"
          value={rePassword}
          onChange={e => setRePassword(e.target.value)}
          required
        />

        {rePassword && (
          <p className={match ? "success" : "error"}>
            {match ? "✔ Passwords match" : "❌ Passwords do not match"}
          </p>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {email && !otpSent && (
          <button type="button" onClick={sendOtp}>
            Send OTP
          </button>
        )}

        {otpSent && !otpVerified && (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />
            <button type="button" onClick={verifyOtp}>
              Verify OTP
            </button>
          </>
        )}

        {otpVerified && <p className="success">✔ Email verified</p>}

        {/* GENDER */}
        <select value={gender} onChange={e => setGender(e.target.value)} required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <button disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="link-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Login.css";

// ── helpers ──────────────────────────────────────────────────────
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function isValidPassword(val) {
  // min 6 chars, has @, has uppercase
  return val.length >= 6 && /[@]/.test(val) && /[A-Z]/.test(val);
}

// ── component ────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passErr, setPassErr]   = useState("");
  const [authErr, setAuthErr]   = useState("");

  const validate = () => {
    let ok = true;
    setAuthErr("");

    if (!email) {
      setEmailErr("Email is required"); ok = false;
    } else if (!isValidEmail(email)) {
      setEmailErr("Invalid email address"); ok = false;
    } else {
      setEmailErr("");
    }

    if (!password) {
      setPassErr("Password is required"); ok = false;
    } else if (!isValidPassword(password)) {
      setPassErr(
        password.length < 6
          ? "Password must be at least 6 characters"
          : !/@/.test(password)
          ? "Password must contain @"
          : "Password must contain an uppercase letter"
      );
      ok = false;
    } else {
      setPassErr("");
    }

    return ok;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check all stored users
    const allUsers = JSON.parse(localStorage.getItem("nx_users") || "[]");
    const match = allUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (match) {
      localStorage.setItem("nx_current", JSON.stringify(match));
      navigate("/dashboard");
    } else {
      setAuthErr("Wrong email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">N</div>
          <span className="auth-logo-text">NexAdmin</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              placeholder="you@company.com"
              className={`form-input ${emailErr ? "error-input" : ""}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
            />
            {emailErr && <p className="field-error">⚠ {emailErr}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Min 6 chars, includes @ and uppercase"
              className={`form-input ${passErr ? "error-input" : ""}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPassErr(""); }}
            />
            {passErr && <p className="field-error">⚠ {passErr}</p>}
          </div>

          {authErr && <p className="auth-error">{authErr}</p>}

          <button type="submit" className="auth-btn">Sign in</button>
        </form>

        <p className="auth-bottom">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;

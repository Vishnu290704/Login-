import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../Css/Login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    const savedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (
      savedUser &&
      savedUser.email === email &&
      savedUser.password === password
    ) {
      navigate("/home");
    } else {
      setError("Wrong Email or Password");
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">

        <h1>Login</h1>
    <form>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setemail(e.target.value)} required
          />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)} required
          />

        <button onClick={handleLogin}>
          Login
        </button>
          </form>

        <p className="error-text">{error}</p>

        <p className="bottom-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;
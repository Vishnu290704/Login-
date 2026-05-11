import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../Css/Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = () => {

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !rePassword
    ) {
      setError("All fields are required");
      return;
    }

    if (password !== rePassword) {
      setError("Passwords do not match");
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      password,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    alert("Signup Successful");

    navigate("/");
  };

  return (
    <div className="signup-page">
      <div className="auth-container">

        <h1>Signup</h1>

        <input
          type="text"
          placeholder="First Name"
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Last Name"
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setemail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Re-enter Password"
          onChange={(e) => setRePassword(e.target.value)}
        />

        <button onClick={handleSignup}>
          Signup
        </button>

        <p className="error-text">{error}</p>

        <p className="bottom-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Signup;
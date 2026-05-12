import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Signup.css";

// ================= HELPER FUNCTIONS =================

// Check email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Check password rules
function isValidPassword(password) {
  return (
    password.length >= 6 &&
    /[@]/.test(password) &&
    /[A-Z]/.test(password)
  );
}

// Password strength
function passwordStrength(password) {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 6) score++;
  if (/[@#$!%^&*]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (password.length >= 10) score++;

  return score;
}

// Strength label
function getStrengthLabel(score) {
  if (score <= 1) {
    return { text: "Weak", className: "weak" };
  }

  if (score <= 2) {
    return { text: "Medium", className: "medium" };
  }

  return { text: "Strong", className: "strong" };
}

// Strength bar color
function getSegmentClass(score, index) {
  if (index >= score) return "";

  if (score <= 1) return "fill-red";
  if (score <= 2) return "fill-yellow";

  return "fill-green";
}

// Generate random ID
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// ================= COMPONENT =================

function Signup() {
  const navigate = useNavigate();

  // ================= STATES =================

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [role, setRole] = useState("user");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  // ================= PASSWORD STRENGTH =================

  const strengthScore = passwordStrength(password);
  const strengthInfo = getStrengthLabel(strengthScore);

  // ================= VALIDATION =================

  const validateForm = () => {
    const newErrors = {};

    // First Name
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Last Name
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Email
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Invalid email address";
    }

    // Password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isValidPassword(password)) {
      newErrors.password =
        "Password must contain 6+ characters, @ and uppercase letter";
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ================= SIGNUP FUNCTION =================

  const handleSignup = (e) => {
    e.preventDefault();

    // Stop if validation fails
    if (!validateForm()) return;

    // Get all users
    const users =
      JSON.parse(localStorage.getItem("nx_users")) || [];

    // Check duplicate email
    const emailExists = users.find(
      (user) => user.email === email
    );

    if (emailExists) {
      setErrors({
        email: "Email already registered",
      });

      return;
    }

    // Current logged user
    const currentUser =
      JSON.parse(localStorage.getItem("nx_current")) || null;

    // ================= ROLE RESTRICTIONS =================

    // Super Admin Creation
    if (role === "superadmin") {
      const existingSuperAdmin = users.find(
        (user) => user.role === "superadmin"
      );

      if (
        existingSuperAdmin &&
        currentUser?.role !== "superadmin"
      ) {
        setErrors({
          global:
            "Only Super Admin can create another Super Admin",
        });

        return;
      }
    }

    // Admin Creation
    if (role === "admin") {
      const existingAdmin = users.find(
        (user) => user.role === "admin"
      );

      if (
        existingAdmin &&
        currentUser?.role !== "superadmin"
      ) {
        setErrors({
          global:
            "Only Super Admin can create Admin accounts",
        });

        return;
      }
    }

    // ================= CREATE USER =================

    const newUser = {
      id: generateId(),

      firstName,
      lastName,

      name: `${firstName} ${lastName}`,

      email,
      password,
      phone,
      role,

      createdBy: currentUser?.id || null,
    };

    // Save user
    users.push(newUser);

    localStorage.setItem(
      "nx_users",
      JSON.stringify(users)
    );

    alert("Account created successfully!");

    navigate("/");
  };

  // ================= INPUT STYLE =================

  const inputClass = (fieldName) => {
    return `form-input ${
      errors[fieldName] ? "error-input" : ""
    }`;
  };

  // ================= UI =================

  return (
    <div className="signup-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">
          <div className="auth-logo-icon">
            N
          </div>

          <span className="auth-logo-text">
            NexAdmin
          </span>
        </div>

        {/* TITLE */}

        <h1 className="auth-title">
          Create Account
        </h1>

        <p className="auth-subtitle">
          Create your dashboard account
        </p>

        {/* GLOBAL ERROR */}

        {errors.global && (
          <p className="auth-error">
            {errors.global}
          </p>
        )}

        {/* FORM */}

        <form onSubmit={handleSignup} noValidate>

          {/* FIRST + LAST NAME */}

          <div className="name-row">

            <div className="form-group">
              <label className="form-label">
                First Name
              </label>

              <input
                type="text"
                placeholder="John"
                className={inputClass("firstName")}
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
              />

              {errors.firstName && (
                <p className="field-error">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Last Name
              </label>

              <input
                type="text"
                placeholder="Doe"
                className={inputClass("lastName")}
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
              />

              {errors.lastName && (
                <p className="field-error">
                  {errors.lastName}
                </p>
              )}
            </div>

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              placeholder="john@gmail.com"
              className={inputClass("email")}
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            {errors.email && (
              <p className="field-error">
                {errors.email}
              </p>
            )}

          </div>

          {/* PHONE */}

          <div className="form-group">

            <label className="form-label">
              Phone
            </label>

            <input
              type="tel"
              placeholder="+91 9876543210"
              className="form-input"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

          </div>

          {/* ROLE */}

          <div className="form-group">

            <label className="form-label">
              Account Role
            </label>

            <select
              className="role-select"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="user">
                User
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="superadmin">
                Super Admin
              </option>

            </select>

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              className={inputClass("password")}
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            {/* PASSWORD STRENGTH */}

            {password && (
              <>
                <div className="strength-bar">

                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`strength-segment ${getSegmentClass(
                        strengthScore,
                        index
                      )}`}
                    />
                  ))}

                </div>

                <p
                  className={`strength-label ${strengthInfo.className}`}
                >
                  {strengthInfo.text}
                </p>
              </>
            )}

            {errors.password && (
              <p className="field-error">
                {errors.password}
              </p>
            )}

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="form-group">

            <label className="form-label">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Re-enter password"
              className={inputClass("confirmPassword")}
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

            {errors.confirmPassword && (
              <p className="field-error">
                {errors.confirmPassword}
              </p>
            )}

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            className="auth-btn"
          >
            Create Account
          </button>

        </form>

        {/* FOOTER */}

        <p className="auth-bottom">

          Already have an account?{" "}

          <span onClick={() => navigate("/")}>
            Sign In
          </span>

        </p>

      </div>

    </div>
  );
}

export default Signup;

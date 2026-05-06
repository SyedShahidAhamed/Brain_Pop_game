import { useState } from "react";
import { signupUser } from "../utils/authStorage";

const initialForm = {
  username: "",
  email: "",
  password: ""
};

function Signup({ onSignup, onNavigate, showToast }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validateForm() {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.username.trim().length < 3) {
      nextErrors.username = "Username must be at least 3 characters.";
    }

    if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Small delay makes the demo loading state visible.
    setTimeout(() => {
      const result = signupUser(formData);
      setIsLoading(false);

      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      onSignup(result.user);
    }, 600);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">F</span>
          <div>
            <h1>Create your Fuzzle account</h1>
            <p>Save your demo profile and jump into today's puzzles.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={updateField}
              placeholder="PuzzleMaster"
            />
            {errors.username && <small>{errors.username}</small>}
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={updateField}
              placeholder="you@example.com"
            />
            {errors.email && <small>{errors.email}</small>}
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={updateField}
              placeholder="At least 6 characters"
            />
            {errors.password && <small>{errors.password}</small>}
          </label>

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? <span className="button-loader"></span> : "Signup"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered?
          <button type="button" onClick={() => onNavigate("/login")}>
            Login
          </button>
        </p>
      </section>
    </main>
  );
}

export default Signup;

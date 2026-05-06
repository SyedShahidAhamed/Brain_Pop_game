import { useState } from "react";
import { loginUser } from "../utils/authStorage";

const initialForm = {
  email: "",
  password: ""
};

function Login({ onLogin, onNavigate, showToast }) {
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

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
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
      const result = loginUser(formData);
      setIsLoading(false);

      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      onLogin(result.user);
    }, 600);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">F</span>
          <div>
            <h1>Welcome to Fuzzle</h1>
            <p>Log in to continue your daily puzzle streak.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
            />
            {errors.password && <small>{errors.password}</small>}
          </label>

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? <span className="button-loader"></span> : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New here?
          <button type="button" onClick={() => onNavigate("/signup")}>
            Create account
          </button>
        </p>
      </section>
    </main>
  );
}

export default Login;

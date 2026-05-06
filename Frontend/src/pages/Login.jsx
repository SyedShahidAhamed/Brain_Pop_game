import { useState } from "react";
import Logo, { APP_NAME } from "../components/Logo";
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
      <section className="auth-shell">
        <aside className="auth-visual" aria-hidden="true">
          <div className="auth-visual-content">
            <Logo size="hero" className="auth-visual-logo" />
            <div className="auth-title-group">
              <h2>$RAIN$YTE</h2>
              <span className="auth-kicker">PUZZLE GAME</span>
            </div>
            <p>PUZZLE GAME. Build your streak, solve the daily set, and watch your activity grid light up.</p>
          </div>
          <div className="auth-metrics">
            <span>5 daily puzzles</span>
            <span>Live streaks</span>
            <span>Activity heatmap</span>
          </div>
        </aside>

        <div className="auth-panel">
          <Logo size="default" showText subtitle="Log in to continue your daily puzzle streak." className="auth-brand" />

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

            <div className="auth-actions">
              <button className="auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? <span className="button-loader"></span> : "Login"}
              </button>

              <button className="auth-secondary" type="button" onClick={() => onNavigate("/signup")}>
                Create account
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;

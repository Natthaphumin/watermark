import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../components/layout/AuthForm.module.css";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../lib/apiClient";
import buttons from "../styles/buttons.module.css";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.card}>
        <h1 className={styles.title}>Log in</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            Email
            <input
              className={styles.input}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            Password
            <input
              className={styles.input}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={`${buttons.btn} ${buttons.btnPrimary} ${buttons.btnFull}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className={styles.switch}>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

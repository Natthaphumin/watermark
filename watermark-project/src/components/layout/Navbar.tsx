import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        Watermark
      </Link>
      <Link to="/editor" className={styles.link}>
        Editor
      </Link>
      {user ? (
        <>
          <Link to="/dashboard" className={styles.link}>
            Dashboard
          </Link>
          <span className={styles.link}>{user.email}</span>
          <button className={styles.button} onClick={handleLogout}>
            Log out
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className={styles.link}>
            Log in
          </Link>
          <Link to="/register" className={styles.link}>
            Register
          </Link>
        </>
      )}
    </nav>
  );
}

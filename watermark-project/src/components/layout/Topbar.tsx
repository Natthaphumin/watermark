import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import buttons from "../../styles/buttons.module.css";
import { LogoutIcon } from "./icons";
import styles from "./Topbar.module.css";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className={styles.topbar}>
      <Link to="/" className={styles.brand}>
        Watermark
      </Link>

      <div className={styles.links}>
        <Link to="/editor" className={styles.link}>
          Editor
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" className={styles.link}>
              Dashboard
            </Link>
            <div className={styles.userChip}>
              <span className={styles.avatar}>{user.email.charAt(0)}</span>
              <span className={styles.email} title={user.email}>
                {user.email}
              </span>
            </div>
            <button className={`${buttons.btn} ${buttons.btnSecondary} ${buttons.btnSmall}`} onClick={handleLogout}>
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
      </div>

      {user && (
        <button
          className={`${styles.iconButton} ${styles.mobileOnly}`}
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogoutIcon width={18} height={18} />
        </button>
      )}
    </header>
  );
}

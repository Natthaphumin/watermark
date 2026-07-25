import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./BottomNav.module.css";
import { DashboardIcon, EditorIcon, HomeIcon } from "./icons";

function tabClassName({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab;
}

export function BottomNav() {
  const { user } = useAuth();

  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={tabClassName}>
        <HomeIcon width={22} height={22} />
        Home
      </NavLink>
      <NavLink to="/editor" className={tabClassName}>
        <EditorIcon width={22} height={22} />
        Editor
      </NavLink>
      <NavLink to={user ? "/dashboard" : "/login"} className={tabClassName}>
        <DashboardIcon width={22} height={22} />
        {user ? "Dashboard" : "Log in"}
      </NavLink>
    </nav>
  );
}

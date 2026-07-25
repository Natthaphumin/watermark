import { Link } from "react-router-dom";
import buttons from "../styles/buttons.module.css";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <div className="page">
      <div className={styles.hero}>
        <div className={styles.copy}>
          <h1>Watermark your photos in the browser</h1>
          <p>
            Upload a photo, add a text and/or logo watermark, drag it into place, and download the
            result. No account needed.
          </p>
          <div className={styles.cta}>
            <Link to="/editor" className={`${buttons.btn} ${buttons.btnPrimary}`}>
              Open the editor →
            </Link>
          </div>
        </div>

        <div className={styles.mockup} aria-hidden="true">
          <div className={styles.mockupPhoto}>
            <span className={styles.mockupSun} />
            <span className={styles.mockupText}>Sample Co.</span>
            <span className={styles.mockupLogo} />
          </div>
        </div>
      </div>
    </div>
  );
}

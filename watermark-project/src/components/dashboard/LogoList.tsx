import type { Logo } from "../../types/watermark";
import styles from "./Dashboard.module.css";

interface LogoListProps {
  logos: Logo[];
  onDelete: (id: string) => void;
}

export function LogoList({ logos, onDelete }: LogoListProps) {
  if (logos.length === 0) return <p className={styles.empty}>No saved logos yet.</p>;

  return (
    <div className={styles.list}>
      {logos.map((logo) => (
        <div key={logo.id} className={styles.item}>
          <img className={styles.thumb} src={logo.url} alt={logo.originalName} />
          <div className={styles.itemMeta}>{logo.originalName}</div>
          <div className={styles.itemActions}>
            <button onClick={() => onDelete(logo.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

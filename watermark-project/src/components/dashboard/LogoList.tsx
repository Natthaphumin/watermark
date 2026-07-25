import type { Logo } from "../../types/watermark";
import buttons from "../../styles/buttons.module.css";
import styles from "./Dashboard.module.css";
import { EmptyState } from "./EmptyState";

interface LogoListProps {
  logos: Logo[];
  onDelete: (id: string) => void;
}

export function LogoList({ logos, onDelete }: LogoListProps) {
  if (logos.length === 0)
    return (
      <EmptyState
        title="No logos yet"
        description="Upload a logo in the editor and save it here to reuse it across your photos."
      />
    );

  return (
    <div className={styles.list}>
      {logos.map((logo) => (
        <div key={logo.id} className={styles.item}>
          <img className={styles.thumb} src={logo.url} alt={logo.originalName} />
          <div className={styles.itemMeta}>{logo.originalName}</div>
          <div className={styles.itemActions}>
            <button
              className={`${buttons.btn} ${buttons.btnDanger} ${buttons.btnSmall}`}
              onClick={() => onDelete(logo.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

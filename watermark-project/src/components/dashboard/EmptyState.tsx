import { Link } from "react-router-dom";
import { EditorIcon } from "../layout/icons";
import buttons from "../../styles/buttons.module.css";
import styles from "./Dashboard.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <EditorIcon width={26} height={26} />
      </div>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDescription}>{description}</p>
      <Link
        to="/editor"
        className={`${buttons.btn} ${buttons.btnPrimary} ${buttons.btnSmall} ${styles.emptyCta}`}
      >
        Open the editor →
      </Link>
    </div>
  );
}

import type { HistoryItem } from "../../types/watermark";
import buttons from "../../styles/buttons.module.css";
import styles from "./Dashboard.module.css";
import { EmptyState } from "./EmptyState";

interface HistoryGridProps {
  items: HistoryItem[];
  onDelete: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function HistoryGrid({ items, onDelete, onLoadMore, hasMore }: HistoryGridProps) {
  if (items.length === 0)
    return (
      <EmptyState
        title="No history yet"
        description="Export a watermarked photo in the editor and it'll show up here."
      />
    );

  return (
    <>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.gridItem}>
            <img className={styles.gridThumb} src={item.thumbnailUrl} alt="Watermarked export" />
            <button
              className={`${buttons.btn} ${buttons.btnDanger} ${buttons.btnSmall}`}
              onClick={() => onDelete(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {hasMore && onLoadMore && (
        <div className={styles.loadMore}>
          <button className={`${buttons.btn} ${buttons.btnSecondary}`} onClick={onLoadMore}>
            Load more
          </button>
        </div>
      )}
    </>
  );
}

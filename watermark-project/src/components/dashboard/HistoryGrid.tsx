import type { HistoryItem } from "../../types/watermark";
import styles from "./Dashboard.module.css";

interface HistoryGridProps {
  items: HistoryItem[];
  onDelete: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function HistoryGrid({ items, onDelete, onLoadMore, hasMore }: HistoryGridProps) {
  if (items.length === 0) return <p className={styles.empty}>No history yet — export a watermarked photo to see it here.</p>;

  return (
    <>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.gridItem}>
            <img className={styles.gridThumb} src={item.thumbnailUrl} alt="Watermarked export" />
            <button onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        ))}
      </div>
      {hasMore && onLoadMore && (
        <div className={styles.loadMore}>
          <button onClick={onLoadMore}>Load more</button>
        </div>
      )}
    </>
  );
}

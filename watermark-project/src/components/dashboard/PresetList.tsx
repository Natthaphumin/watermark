import { useNavigate } from "react-router-dom";
import type { Preset } from "../../types/watermark";
import buttons from "../../styles/buttons.module.css";
import styles from "./Dashboard.module.css";
import { EmptyState } from "./EmptyState";

interface PresetListProps {
  presets: Preset[];
  onDelete: (id: string) => void;
}

function describePreset(preset: Preset): string {
  const parts: string[] = [];
  if (preset.textContent) parts.push(`text: "${preset.textContent}"`);
  if (preset.logoId) parts.push("logo");
  return parts.join(" + ") || "empty";
}

export function PresetList({ presets, onDelete }: PresetListProps) {
  const navigate = useNavigate();

  if (presets.length === 0)
    return (
      <EmptyState
        title="No presets yet"
        description="Save your watermark settings as a preset in the editor so you can reuse them next time."
      />
    );

  return (
    <div className={styles.list}>
      {presets.map((preset) => (
        <div key={preset.id} className={styles.item}>
          <div>
            <div className={styles.itemName}>{preset.name}</div>
            <div className={styles.itemMeta}>{describePreset(preset)}</div>
          </div>
          <div className={styles.itemActions}>
            <button
              className={`${buttons.btn} ${buttons.btnSecondary} ${buttons.btnSmall}`}
              onClick={() => navigate("/editor", { state: { presetId: preset.id } })}
            >
              Load
            </button>
            <button
              className={`${buttons.btn} ${buttons.btnDanger} ${buttons.btnSmall}`}
              onClick={() => onDelete(preset.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

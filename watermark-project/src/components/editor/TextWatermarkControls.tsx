import type { TextWatermarkConfig } from "../../types/watermark";
import styles from "./Controls.module.css";

interface TextWatermarkControlsProps {
  config: TextWatermarkConfig;
  onChange: (patch: Partial<TextWatermarkConfig>) => void;
}

const FONT_OPTIONS = ["sans-serif", "serif", "monospace", "cursive"];

export function TextWatermarkControls({ config, onChange }: TextWatermarkControlsProps) {
  return (
    <div className={styles.section}>
      <label className={styles.header}>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
        />
        Text watermark
      </label>

      {config.enabled && (
        <>
          <div className={styles.row}>
            <label>Text</label>
            <input
              className={styles.textInput}
              type="text"
              value={config.content}
              onChange={(e) => onChange({ content: e.target.value })}
              maxLength={200}
            />
          </div>
          <div className={styles.row}>
            <label>Font</label>
            <select value={config.font} onChange={(e) => onChange({ font: e.target.value })}>
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <label>Color</label>
            <input
              type="color"
              value={config.color}
              onChange={(e) => onChange({ color: e.target.value })}
            />
          </div>
          <div className={styles.row}>
            <label>Size</label>
            <input
              type="range"
              min={12}
              max={200}
              value={config.size}
              onChange={(e) => onChange({ size: Number(e.target.value) })}
            />
            <span>{config.size}px</span>
          </div>
          <div className={styles.row}>
            <label>Opacity</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.opacity}
              onChange={(e) => onChange({ opacity: Number(e.target.value) })}
            />
            <span>{Math.round(config.opacity * 100)}%</span>
          </div>
          <div className={styles.row}>
            <label>Rotation</label>
            <input
              type="range"
              min={-180}
              max={180}
              value={config.rotation}
              onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            />
            <span>{config.rotation}°</span>
          </div>
        </>
      )}
    </div>
  );
}

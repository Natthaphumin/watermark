import { useRef, useState } from "react";
import type { Logo, LogoWatermarkConfig } from "../../types/watermark";
import buttons from "../../styles/buttons.module.css";
import styles from "./Controls.module.css";

interface LogoWatermarkControlsProps {
  config: LogoWatermarkConfig;
  onChange: (patch: Partial<LogoWatermarkConfig>) => void;
  onFileSelected: (file: File) => void;
  savedLogos?: Logo[];
  onSelectSavedLogo?: (logo: Logo) => void;
}

export function LogoWatermarkControls({
  config,
  onChange,
  onFileSelected,
  savedLogos,
  onSelectSavedLogo,
}: LogoWatermarkControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className={styles.section}>
      <label className={styles.header}>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
        />
        Logo watermark
      </label>

      {config.enabled && (
        <>
          <div className={styles.row}>
            <label>Upload PNG</label>
            <button
              type="button"
              className={`${buttons.btn} ${buttons.btnSecondary} ${buttons.btnSmall}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {fileName ?? "Choose file"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onFileSelected(file);
                  setFileName(file.name);
                }
                e.target.value = "";
              }}
            />
          </div>

          {savedLogos && savedLogos.length > 0 && (
            <div className={styles.row}>
              <label>Saved logos</label>
              <select
                value={config.savedLogoId ?? ""}
                onChange={(e) => {
                  const logo = savedLogos.find((l) => l.id === e.target.value);
                  if (logo) onSelectSavedLogo?.(logo);
                }}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {savedLogos.map((logo) => (
                  <option key={logo.id} value={logo.id}>
                    {logo.originalName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.row}>
            <label>Scale</label>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.01}
              value={config.scale}
              onChange={(e) => onChange({ scale: Number(e.target.value) })}
            />
            <span>{Math.round(config.scale * 100)}%</span>
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
        </>
      )}
    </div>
  );
}

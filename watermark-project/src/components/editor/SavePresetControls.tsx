import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../lib/apiClient";
import type { LogoWatermarkConfig, Preset, TextWatermarkConfig } from "../../types/watermark";
import buttons from "../../styles/buttons.module.css";
import styles from "./SavePresetControls.module.css";

interface SavePresetControlsProps {
  text: TextWatermarkConfig;
  logo: LogoWatermarkConfig;
  onSaved: (preset: Preset) => void;
}

export function SavePresetControls({ text, logo, onSaved }: SavePresetControlsProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <p className={styles.hint}>Log in to save this watermark as a reusable preset.</p>;
  }

  const hasContent = (text.enabled && text.content.trim().length > 0) || (logo.enabled && logo.savedLogoId);
  const logoPending = logo.enabled && !logo.savedLogoId;

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const { preset } = await apiClient.post<{ preset: Preset }>("/presets", {
        name,
        textContent: text.enabled ? text.content : null,
        textFont: text.enabled ? text.font : null,
        textColor: text.enabled ? text.color : null,
        textSize: text.enabled ? text.size : null,
        textOpacity: text.enabled ? text.opacity : null,
        textRotation: text.enabled ? text.rotation : null,
        textPositionX: text.enabled ? text.x : null,
        textPositionY: text.enabled ? text.y : null,
        logoId: logo.enabled ? logo.savedLogoId : null,
        logoScale: logo.enabled ? logo.scale : null,
        logoOpacity: logo.enabled ? logo.opacity : null,
        logoPositionX: logo.enabled ? logo.x : null,
        logoPositionY: logo.enabled ? logo.y : null,
      });
      onSaved(preset);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          placeholder="Preset name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
        <button
          className={`${buttons.btn} ${buttons.btnPrimary} ${buttons.btnSmall}`}
          onClick={handleSave}
          disabled={!name || !hasContent || logoPending || saving}
        >
          {saving ? "Saving…" : "Save preset"}
        </button>
      </div>
      {logoPending && <p className={styles.hint}>Save your logo to your library first.</p>}
      {error && <p className={styles.hint}>{error}</p>}
    </div>
  );
}

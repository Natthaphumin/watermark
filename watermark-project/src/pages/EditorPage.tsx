import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ExportButton } from "../components/editor/ExportButton";
import { ImageDropzone } from "../components/editor/ImageDropzone";
import { LogoWatermarkControls } from "../components/editor/LogoWatermarkControls";
import { SavePresetControls } from "../components/editor/SavePresetControls";
import { TextWatermarkControls } from "../components/editor/TextWatermarkControls";
import { WatermarkCanvas } from "../components/editor/WatermarkCanvas";
import { useAuth } from "../hooks/useAuth";
import { useWatermarkCanvas } from "../hooks/useWatermarkCanvas";
import { apiClient } from "../lib/apiClient";
import { loadImage } from "../lib/canvasRender";
import type { Logo, Preset } from "../types/watermark";
import buttons from "../styles/buttons.module.css";
import styles from "./EditorPage.module.css";

export function EditorPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { state, setImage, setText, setLogo, setLogoImage, loadPreset } = useWatermarkCanvas();

  const [savedLogos, setSavedLogos] = useState<Logo[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.resolve()
      .then(() => (user ? apiClient.get<{ logos: Logo[] }>("/logos") : { logos: [] }))
      .then((res) => setSavedLogos(res.logos))
      .catch(() => setSavedLogos([]));
  }, [user]);

  useEffect(() => {
    const presetId = (location.state as { presetId?: string } | null)?.presetId;
    if (!presetId || !user) return;

    (async () => {
      const { preset } = await apiClient.get<{ preset: Preset }>(`/presets/${presetId}`);
      let logoImage = null;
      if (preset.logoId) {
        const logos = savedLogos.length
          ? savedLogos
          : (await apiClient.get<{ logos: Logo[] }>("/logos")).logos;
        const logo = logos.find((l) => l.id === preset.logoId);
        if (logo) logoImage = await loadImage(logo.url);
      }
      loadPreset(preset, logoImage);
      setStatusMessage(`Loaded preset "${preset.name}" — upload a photo to see it applied.`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, user]);

  async function handleImageSelected(file: File) {
    const url = URL.createObjectURL(file);
    const image = await loadImage(url);
    setImage(image);
    setStatusMessage(null);
  }

  async function handleLogoFileSelected(file: File) {
    const url = URL.createObjectURL(file);
    const image = await loadImage(url);
    setLogoImage(image);
    setLogo({ enabled: true, imageSrc: url, savedLogoId: null });
    setLogoFile(file);
  }

  async function handleSelectSavedLogo(logo: Logo) {
    const image = await loadImage(logo.url);
    setLogoImage(image);
    setLogo({ enabled: true, imageSrc: logo.url, savedLogoId: logo.id });
    setLogoFile(null);
  }

  async function handleSaveLogoToLibrary() {
    if (!logoFile) return;
    setSavingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", logoFile);
      const { logo } = await apiClient.post<{ logo: Logo }>("/logos", formData);
      setSavedLogos((prev) => [logo, ...prev]);
      setLogo({ savedLogoId: logo.id });
      setLogoFile(null);
      setStatusMessage("Logo saved to your library");
    } finally {
      setSavingLogo(false);
    }
  }

  return (
    <div className="page">
      <h1>Editor</h1>
      {statusMessage && <p className={styles.status}>{statusMessage}</p>}

      {!state.image ? (
        <ImageDropzone onFileSelected={handleImageSelected} />
      ) : (
        <div className={styles.layout}>
          <WatermarkCanvas
            state={state}
            onMoveText={(x, y) => setText({ x, y })}
            onMoveLogo={(x, y) => setLogo({ x, y })}
          />
          <div className={styles.sidebar}>
            <TextWatermarkControls config={state.text} onChange={setText} />
            <LogoWatermarkControls
              config={state.logo}
              onChange={setLogo}
              onFileSelected={handleLogoFileSelected}
              savedLogos={savedLogos}
              onSelectSavedLogo={handleSelectSavedLogo}
            />
            {logoFile && user && (
              <button
                className={`${buttons.btn} ${buttons.btnSecondary} ${buttons.btnSmall}`}
                onClick={handleSaveLogoToLibrary}
                disabled={savingLogo}
              >
                {savingLogo ? "Saving logo…" : "Save this logo to your library"}
              </button>
            )}

            <div className={styles.actions}>
              <ExportButton state={state} />
              <button
                className={`${buttons.btn} ${buttons.btnSecondary}`}
                onClick={() => replaceImageInputRef.current?.click()}
              >
                Change photo
              </button>
              <input
                ref={replaceImageInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelected(file);
                  e.target.value = "";
                }}
              />
            </div>

            <SavePresetControls
              text={state.text}
              logo={state.logo}
              onSaved={(preset) => setStatusMessage(`Saved preset "${preset.name}"`)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

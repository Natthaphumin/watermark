import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../lib/apiClient";
import { canvasToBlob, renderWatermarkedImage } from "../../lib/canvasRender";
import type { WatermarkState } from "../../hooks/useWatermarkCanvas";
import buttons from "../../styles/buttons.module.css";

const THUMBNAIL_MAX_SIZE = 400;

interface ExportButtonProps {
  state: WatermarkState;
}

function renderOffscreen(state: WatermarkState, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  renderWatermarkedImage(ctx, state.image!, width, height, state.text, state.logo, state.logoImage);
  return canvas;
}

export function ExportButton({ state }: ExportButtonProps) {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!state.image) return;
    setExporting(true);
    try {
      const fullCanvas = renderOffscreen(state, state.imageWidth, state.imageHeight);
      const fullBlob = await canvasToBlob(fullCanvas, "image/png");

      const a = document.createElement("a");
      a.href = URL.createObjectURL(fullBlob);
      a.download = "watermarked.png";
      a.click();
      URL.revokeObjectURL(a.href);

      if (user) {
        const scale = Math.min(1, THUMBNAIL_MAX_SIZE / Math.max(state.imageWidth, state.imageHeight));
        const thumbWidth = Math.round(state.imageWidth * scale);
        const thumbHeight = Math.round(state.imageHeight * scale);
        const thumbCanvas = renderOffscreen(state, thumbWidth, thumbHeight);
        const thumbBlob = await canvasToBlob(thumbCanvas, "image/jpeg", 0.7);

        const formData = new FormData();
        formData.append("file", thumbBlob, "thumbnail.jpg");
        await apiClient.post("/history", formData);
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      className={`${buttons.btn} ${buttons.btnPrimary}`}
      onClick={handleExport}
      disabled={!state.image || exporting}
    >
      {exporting ? "Exporting…" : "Download"}
    </button>
  );
}

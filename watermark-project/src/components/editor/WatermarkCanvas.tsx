import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  getLogoDrawRect,
  measureTextBounds,
  renderWatermarkedImage,
} from "../../lib/canvasRender";
import type { WatermarkState } from "../../hooks/useWatermarkCanvas";
import styles from "./WatermarkCanvas.module.css";

const MAX_PREVIEW_SIZE = 900;

interface WatermarkCanvasProps {
  state: WatermarkState;
  onMoveText: (x: number, y: number) => void;
  onMoveLogo: (x: number, y: number) => void;
}

type DragTarget = "text" | "logo" | null;

export function WatermarkCanvas({ state, onMoveText, onMoveLogo }: WatermarkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);

  const scale = Math.min(1, MAX_PREVIEW_SIZE / Math.max(state.imageWidth, state.imageHeight, 1));
  const canvasWidth = Math.round(state.imageWidth * scale);
  const canvasHeight = Math.round(state.imageHeight * scale);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state.image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderWatermarkedImage(
      ctx,
      state.image,
      canvasWidth,
      canvasHeight,
      state.text,
      state.logo,
      state.logoImage,
    );
  }, [state, canvasWidth, canvasHeight]);

  function toCanvasPoint(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { px, py, xNorm: px / canvas.width, yNorm: py / canvas.height };
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !state.image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { px, py } = toCanvasPoint(e);

    if (state.logo.enabled && state.logoImage) {
      const rect = getLogoDrawRect(state.logo, state.logoImage, canvasWidth, canvasHeight);
      if (px >= rect.left && px <= rect.left + rect.width && py >= rect.top && py <= rect.top + rect.height) {
        setDragTarget("logo");
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    if (state.text.enabled && state.text.content) {
      const rect = measureTextBounds(ctx, state.text, canvasWidth, canvasHeight);
      if (px >= rect.left && px <= rect.left + rect.width && py >= rect.top && py <= rect.top + rect.height) {
        setDragTarget("text");
        canvas.setPointerCapture(e.pointerId);
      }
    }
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!dragTarget) return;
    const { xNorm, yNorm } = toCanvasPoint(e);
    const clampedX = Math.min(1, Math.max(0, xNorm));
    const clampedY = Math.min(1, Math.max(0, yNorm));
    if (dragTarget === "text") onMoveText(clampedX, clampedY);
    else onMoveLogo(clampedX, clampedY);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (dragTarget) canvasRef.current?.releasePointerCapture(e.pointerId);
    setDragTarget(null);
  }

  const draggable = state.text.enabled || state.logo.enabled;

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`${styles.canvas} ${draggable ? styles.draggable : ""} ${dragTarget ? styles.dragging : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}

import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LOGO_CONFIG, DEFAULT_TEXT_CONFIG } from "../types/watermark";
import { getLogoDrawRect, measureTextBounds, renderWatermarkedImage } from "./canvasRender";

function makeCtx() {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  return canvas.getContext("2d") as CanvasRenderingContext2D;
}

// vitest-canvas-mock's drawImage validates its argument against real DOM
// element constructors, so image-like fixtures need to be actual elements
// (a canvas satisfies CanvasImageSource and exposes width/height like an
// image's naturalWidth/naturalHeight fallback path in getLogoDrawRect).
function makeImageLike(width: number, height: number): CanvasImageSource {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

describe("getLogoDrawRect", () => {
  it("centers the logo at the configured x/y and scales relative to canvas width", () => {
    const logoImage = { naturalWidth: 200, naturalHeight: 100 } as unknown as CanvasImageSource;
    const rect = getLogoDrawRect(
      { ...DEFAULT_LOGO_CONFIG, scale: 0.2, x: 0.5, y: 0.5 },
      logoImage,
      1000,
      500,
    );

    expect(rect.width).toBe(200); // 1000 * 0.2
    expect(rect.height).toBe(100); // width * (100/200) aspect ratio preserved
    expect(rect.left).toBe(1000 * 0.5 - 200 / 2);
    expect(rect.top).toBe(500 * 0.5 - 100 / 2);
  });
});

describe("measureTextBounds", () => {
  it("returns a bounding box centered on the configured x/y", () => {
    const ctx = makeCtx();
    const bounds = measureTextBounds(ctx, DEFAULT_TEXT_CONFIG, 800, 600);

    expect(bounds.height).toBe(DEFAULT_TEXT_CONFIG.size);
    expect(bounds.left).toBeCloseTo(DEFAULT_TEXT_CONFIG.x * 800 - bounds.width / 2);
    expect(bounds.top).toBeCloseTo(DEFAULT_TEXT_CONFIG.y * 600 - bounds.height / 2);
  });
});

describe("renderWatermarkedImage", () => {
  const sourceImage = makeImageLike(800, 600);

  it("always draws the base image", () => {
    const ctx = makeCtx();
    const drawImage = vi.spyOn(ctx, "drawImage");

    renderWatermarkedImage(
      ctx,
      sourceImage,
      800,
      600,
      { ...DEFAULT_TEXT_CONFIG, enabled: false },
      { ...DEFAULT_LOGO_CONFIG, enabled: false },
      null,
    );

    expect(drawImage).toHaveBeenCalledWith(sourceImage, 0, 0, 800, 600);
  });

  it("draws text only when enabled with non-empty content", () => {
    const ctx = makeCtx();
    const fillText = vi.spyOn(ctx, "fillText");

    renderWatermarkedImage(
      ctx,
      sourceImage,
      800,
      600,
      { ...DEFAULT_TEXT_CONFIG, enabled: false, content: "hello" },
      { ...DEFAULT_LOGO_CONFIG, enabled: false },
      null,
    );
    expect(fillText).not.toHaveBeenCalled();

    renderWatermarkedImage(
      ctx,
      sourceImage,
      800,
      600,
      { ...DEFAULT_TEXT_CONFIG, enabled: true, content: "hello" },
      { ...DEFAULT_LOGO_CONFIG, enabled: false },
      null,
    );
    expect(fillText).toHaveBeenCalledWith("hello", 0, 0);
  });

  it("draws the logo only when enabled and a logo image is present", () => {
    const ctx = makeCtx();
    const logoImage = makeImageLike(100, 100);
    const drawImage = vi.spyOn(ctx, "drawImage");

    renderWatermarkedImage(
      ctx,
      sourceImage,
      800,
      600,
      { ...DEFAULT_TEXT_CONFIG, enabled: false },
      { ...DEFAULT_LOGO_CONFIG, enabled: true },
      null, // no logo image loaded yet
    );
    expect(drawImage).toHaveBeenCalledTimes(1); // base image only

    renderWatermarkedImage(
      ctx,
      sourceImage,
      800,
      600,
      { ...DEFAULT_TEXT_CONFIG, enabled: false },
      { ...DEFAULT_LOGO_CONFIG, enabled: true },
      logoImage,
    );
    expect(drawImage).toHaveBeenCalledTimes(3); // base image + logo image
  });
});

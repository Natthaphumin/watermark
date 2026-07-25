import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Preset } from "../types/watermark";
import { useWatermarkCanvas } from "./useWatermarkCanvas";

function makeImage(width: number, height: number): HTMLImageElement {
  const img = new Image();
  Object.defineProperty(img, "naturalWidth", { value: width });
  Object.defineProperty(img, "naturalHeight", { value: height });
  return img;
}

function makePreset(overrides: Partial<Preset> = {}): Preset {
  return {
    id: "preset-1",
    name: "test preset",
    textContent: null,
    textFont: null,
    textColor: null,
    textSize: null,
    textOpacity: null,
    textRotation: null,
    textPositionX: null,
    textPositionY: null,
    logoId: null,
    logoScale: null,
    logoOpacity: null,
    logoPositionX: null,
    logoPositionY: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("useWatermarkCanvas", () => {
  it("sets image dimensions from the loaded image", () => {
    const { result } = renderHook(() => useWatermarkCanvas());

    act(() => result.current.setImage(makeImage(800, 600)));

    expect(result.current.state.imageWidth).toBe(800);
    expect(result.current.state.imageHeight).toBe(600);
  });

  it("merges partial patches into the text config", () => {
    const { result } = renderHook(() => useWatermarkCanvas());

    act(() => result.current.setText({ enabled: true, content: "hi" }));
    expect(result.current.state.text.enabled).toBe(true);
    expect(result.current.state.text.content).toBe("hi");

    act(() => result.current.setText({ x: 0.2 }));
    expect(result.current.state.text.x).toBe(0.2);
    expect(result.current.state.text.content).toBe("hi"); // untouched fields survive the patch
  });

  it("loads a text-only preset, disabling the logo", () => {
    const { result } = renderHook(() => useWatermarkCanvas());
    const preset = makePreset({ textContent: "Loaded text", textSize: 72 });

    act(() => result.current.loadPreset(preset, null));

    expect(result.current.state.text.enabled).toBe(true);
    expect(result.current.state.text.content).toBe("Loaded text");
    expect(result.current.state.text.size).toBe(72);
    expect(result.current.state.logo.enabled).toBe(false);
  });

  it("loads a logo-only preset, disabling the text and attaching the logo image", () => {
    const { result } = renderHook(() => useWatermarkCanvas());
    const logoImage = makeImage(100, 100);
    const preset = makePreset({ logoId: "logo-1", logoScale: 0.4 });

    act(() => result.current.loadPreset(preset, logoImage));

    expect(result.current.state.logo.enabled).toBe(true);
    expect(result.current.state.logo.savedLogoId).toBe("logo-1");
    expect(result.current.state.logo.scale).toBe(0.4);
    expect(result.current.state.logoImage).toBe(logoImage);
    expect(result.current.state.text.enabled).toBe(false);
  });

  it("falls back to defaults for preset fields left null", () => {
    const { result } = renderHook(() => useWatermarkCanvas());
    const preset = makePreset({ textContent: "just text" }); // no size/opacity/etc set

    act(() => result.current.loadPreset(preset, null));

    expect(result.current.state.text.size).toBe(48); // DEFAULT_TEXT_CONFIG.size
    expect(result.current.state.text.opacity).toBe(0.8);
  });

  it("resets watermarks back to defaults", () => {
    const { result } = renderHook(() => useWatermarkCanvas());

    act(() => result.current.setText({ enabled: true, content: "x" }));
    act(() => result.current.resetWatermarks());

    expect(result.current.state.text.enabled).toBe(false);
    expect(result.current.state.logo.enabled).toBe(false);
    expect(result.current.state.logoImage).toBeNull();
  });
});

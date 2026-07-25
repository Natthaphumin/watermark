import { useReducer } from "react";
import {
  DEFAULT_LOGO_CONFIG,
  DEFAULT_TEXT_CONFIG,
  type LogoWatermarkConfig,
  type Preset,
  type TextWatermarkConfig,
} from "../types/watermark";

export interface WatermarkState {
  image: HTMLImageElement | null;
  imageWidth: number;
  imageHeight: number;
  text: TextWatermarkConfig;
  logo: LogoWatermarkConfig;
  logoImage: HTMLImageElement | null;
}

type Action =
  | { type: "SET_IMAGE"; image: HTMLImageElement }
  | { type: "SET_TEXT"; patch: Partial<TextWatermarkConfig> }
  | { type: "SET_LOGO"; patch: Partial<LogoWatermarkConfig> }
  | { type: "SET_LOGO_IMAGE"; image: HTMLImageElement | null }
  | { type: "LOAD_PRESET"; preset: Preset; logoImage: HTMLImageElement | null }
  | { type: "RESET_WATERMARKS" };

const initialState: WatermarkState = {
  image: null,
  imageWidth: 0,
  imageHeight: 0,
  text: DEFAULT_TEXT_CONFIG,
  logo: DEFAULT_LOGO_CONFIG,
  logoImage: null,
};

function reducer(state: WatermarkState, action: Action): WatermarkState {
  switch (action.type) {
    case "SET_IMAGE":
      return {
        ...state,
        image: action.image,
        imageWidth: action.image.naturalWidth,
        imageHeight: action.image.naturalHeight,
      };
    case "SET_TEXT":
      return { ...state, text: { ...state.text, ...action.patch } };
    case "SET_LOGO":
      return { ...state, logo: { ...state.logo, ...action.patch } };
    case "SET_LOGO_IMAGE":
      return { ...state, logoImage: action.image };
    case "LOAD_PRESET": {
      const { preset, logoImage } = action;
      const text: TextWatermarkConfig = preset.textContent
        ? {
            enabled: true,
            content: preset.textContent,
            font: preset.textFont ?? DEFAULT_TEXT_CONFIG.font,
            color: preset.textColor ?? DEFAULT_TEXT_CONFIG.color,
            size: preset.textSize ?? DEFAULT_TEXT_CONFIG.size,
            opacity: preset.textOpacity ?? DEFAULT_TEXT_CONFIG.opacity,
            rotation: preset.textRotation ?? DEFAULT_TEXT_CONFIG.rotation,
            x: preset.textPositionX ?? DEFAULT_TEXT_CONFIG.x,
            y: preset.textPositionY ?? DEFAULT_TEXT_CONFIG.y,
          }
        : { ...DEFAULT_TEXT_CONFIG, enabled: false };
      const logo: LogoWatermarkConfig = preset.logoId
        ? {
            enabled: true,
            imageSrc: logoImage?.src ?? null,
            savedLogoId: preset.logoId,
            scale: preset.logoScale ?? DEFAULT_LOGO_CONFIG.scale,
            opacity: preset.logoOpacity ?? DEFAULT_LOGO_CONFIG.opacity,
            x: preset.logoPositionX ?? DEFAULT_LOGO_CONFIG.x,
            y: preset.logoPositionY ?? DEFAULT_LOGO_CONFIG.y,
          }
        : { ...DEFAULT_LOGO_CONFIG, enabled: false };
      return { ...state, text, logo, logoImage };
    }
    case "RESET_WATERMARKS":
      return { ...state, text: DEFAULT_TEXT_CONFIG, logo: DEFAULT_LOGO_CONFIG, logoImage: null };
    default:
      return state;
  }
}

export function useWatermarkCanvas() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    state,
    setImage: (image: HTMLImageElement) => dispatch({ type: "SET_IMAGE", image }),
    setText: (patch: Partial<TextWatermarkConfig>) => dispatch({ type: "SET_TEXT", patch }),
    setLogo: (patch: Partial<LogoWatermarkConfig>) => dispatch({ type: "SET_LOGO", patch }),
    setLogoImage: (image: HTMLImageElement | null) => dispatch({ type: "SET_LOGO_IMAGE", image }),
    loadPreset: (preset: Preset, logoImage: HTMLImageElement | null) =>
      dispatch({ type: "LOAD_PRESET", preset, logoImage }),
    resetWatermarks: () => dispatch({ type: "RESET_WATERMARKS" }),
  };
}

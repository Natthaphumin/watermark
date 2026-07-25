export interface TextWatermarkConfig {
  enabled: boolean;
  content: string;
  font: string;
  color: string;
  size: number;
  opacity: number;
  rotation: number;
  x: number;
  y: number;
}

export interface LogoWatermarkConfig {
  enabled: boolean;
  imageSrc: string | null;
  savedLogoId: string | null;
  scale: number;
  opacity: number;
  x: number;
  y: number;
}

export interface Logo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  createdAt: string;
}

export interface Preset {
  id: string;
  name: string;
  textContent: string | null;
  textFont: string | null;
  textColor: string | null;
  textSize: number | null;
  textOpacity: number | null;
  textRotation: number | null;
  textPositionX: number | null;
  textPositionY: number | null;
  logoId: string | null;
  logoScale: number | null;
  logoOpacity: number | null;
  logoPositionX: number | null;
  logoPositionY: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryItem {
  id: string;
  thumbnailUrl: string;
  createdAt: string;
}

export const DEFAULT_TEXT_CONFIG: TextWatermarkConfig = {
  enabled: false,
  content: "Your text here",
  font: "sans-serif",
  color: "#ffffff",
  size: 48,
  opacity: 0.8,
  rotation: 0,
  x: 0.5,
  y: 0.5,
};

export const DEFAULT_LOGO_CONFIG: LogoWatermarkConfig = {
  enabled: false,
  imageSrc: null,
  savedLogoId: null,
  scale: 0.2,
  opacity: 0.8,
  x: 0.85,
  y: 0.85,
};

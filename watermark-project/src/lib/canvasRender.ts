import type { LogoWatermarkConfig, TextWatermarkConfig } from "../types/watermark";

export function renderWatermarkedImage(
  ctx: CanvasRenderingContext2D,
  sourceImage: CanvasImageSource,
  canvasWidth: number,
  canvasHeight: number,
  textConfig: TextWatermarkConfig,
  logoConfig: LogoWatermarkConfig,
  logoImage: CanvasImageSource | null,
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(sourceImage, 0, 0, canvasWidth, canvasHeight);

  if (textConfig.enabled && textConfig.content) {
    ctx.save();
    ctx.translate(textConfig.x * canvasWidth, textConfig.y * canvasHeight);
    ctx.rotate((textConfig.rotation * Math.PI) / 180);
    ctx.globalAlpha = textConfig.opacity;
    ctx.fillStyle = textConfig.color;
    ctx.font = `${textConfig.size}px ${textConfig.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(textConfig.content, 0, 0);
    ctx.restore();
  }

  if (logoConfig.enabled && logoImage) {
    const rect = getLogoDrawRect(logoConfig, logoImage, canvasWidth, canvasHeight);
    ctx.save();
    ctx.globalAlpha = logoConfig.opacity;
    ctx.drawImage(logoImage, rect.left, rect.top, rect.width, rect.height);
    ctx.restore();
  }
}

export function getLogoDrawRect(
  logoConfig: LogoWatermarkConfig,
  logoImage: CanvasImageSource,
  canvasWidth: number,
  canvasHeight: number,
) {
  const naturalWidth =
    "naturalWidth" in logoImage ? logoImage.naturalWidth : (logoImage as HTMLCanvasElement).width;
  const naturalHeight =
    "naturalHeight" in logoImage
      ? logoImage.naturalHeight
      : (logoImage as HTMLCanvasElement).height;

  const drawWidth = canvasWidth * logoConfig.scale;
  const drawHeight = drawWidth * (naturalHeight / naturalWidth);

  return {
    left: logoConfig.x * canvasWidth - drawWidth / 2,
    top: logoConfig.y * canvasHeight - drawHeight / 2,
    width: drawWidth,
    height: drawHeight,
  };
}

export function measureTextBounds(
  ctx: CanvasRenderingContext2D,
  textConfig: TextWatermarkConfig,
  canvasWidth: number,
  canvasHeight: number,
) {
  ctx.save();
  ctx.font = `${textConfig.size}px ${textConfig.font}`;
  const metrics = ctx.measureText(textConfig.content);
  ctx.restore();

  const width = metrics.width;
  const height = textConfig.size;
  const centerX = textConfig.x * canvasWidth;
  const centerY = textConfig.y * canvasHeight;

  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    width,
    height,
  };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to export canvas"))),
      type,
      quality,
    );
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

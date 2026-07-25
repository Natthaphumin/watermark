import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.join(__dirname, "../../uploads");
export const logosDir = path.join(uploadsRoot, "logos");
export const thumbnailsDir = path.join(uploadsRoot, "thumbnails");

mkdirSync(logosDir, { recursive: true });
mkdirSync(thumbnailsDir, { recursive: true });

const extForMimetype: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

function makeStorage(destDir: string) {
  return multer.diskStorage({
    destination: destDir,
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extForMimetype[file.mimetype]}`),
  });
}

export const logoUpload = multer({
  storage: makeStorage(logosDir),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "image/png") {
      cb(new Error("Only PNG logos are supported"));
      return;
    }
    cb(null, true);
  },
});

export const thumbnailUpload = multer({
  storage: makeStorage(thumbnailsDir),
  limits: { fileSize: 500 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!extForMimetype[file.mimetype]) {
      cb(new Error("Only JPEG or PNG thumbnails are supported"));
      return;
    }
    cb(null, true);
  },
});

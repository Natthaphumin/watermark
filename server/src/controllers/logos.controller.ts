import { unlink } from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { logosDir } from "../middleware/upload.middleware.js";
import { HttpError } from "../middleware/error.middleware.js";

export async function listLogos(req: Request, res: Response) {
  const logos = await prisma.logo.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ logos });
}

export async function uploadLogo(req: Request, res: Response) {
  if (!req.file) throw new HttpError(400, "No file uploaded");

  const logo = await prisma.logo.create({
    data: {
      userId: req.user!.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/logos/${req.file.filename}`,
    },
  });
  res.status(201).json({ logo });
}

export async function deleteLogo(req: Request, res: Response) {
  const logo = await prisma.logo.findUnique({ where: { id: req.params.id as string } });
  if (!logo || logo.userId !== req.user!.id) throw new HttpError(404, "Logo not found");

  await prisma.logo.delete({ where: { id: logo.id } });
  await unlink(path.join(logosDir, logo.filename)).catch(() => {});
  res.status(204).send();
}

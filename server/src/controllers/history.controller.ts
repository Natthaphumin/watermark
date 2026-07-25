import { unlink } from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.middleware.js";
import { thumbnailsDir } from "../middleware/upload.middleware.js";

export async function listHistory(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = 24;

  const items = await prisma.historyItem.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  res.status(200).json({ items, page });
}

export async function uploadHistory(req: Request, res: Response) {
  if (!req.file) throw new HttpError(400, "No file uploaded");

  const item = await prisma.historyItem.create({
    data: {
      userId: req.user!.id,
      thumbnailFilename: req.file.filename,
      thumbnailUrl: `/uploads/thumbnails/${req.file.filename}`,
    },
  });
  res.status(201).json({ item });
}

export async function deleteHistory(req: Request, res: Response) {
  const item = await prisma.historyItem.findUnique({ where: { id: req.params.id as string } });
  if (!item || item.userId !== req.user!.id) throw new HttpError(404, "History item not found");

  await prisma.historyItem.delete({ where: { id: item.id } });
  await unlink(path.join(thumbnailsDir, item.thumbnailFilename)).catch(() => {});
  res.status(204).send();
}

import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.middleware.js";

const presetSchema = z
  .object({
    name: z.string().min(1).max(80),
    textContent: z.string().min(1).max(200).nullish(),
    textFont: z.string().min(1).max(80).nullish(),
    textColor: z.string().min(1).max(20).nullish(),
    textSize: z.number().min(1).max(1000).nullish(),
    textOpacity: z.number().min(0).max(1).nullish(),
    textRotation: z.number().min(-360).max(360).nullish(),
    textPositionX: z.number().min(0).max(1).nullish(),
    textPositionY: z.number().min(0).max(1).nullish(),
    logoId: z.string().min(1).nullish(),
    logoScale: z.number().min(0).max(10).nullish(),
    logoOpacity: z.number().min(0).max(1).nullish(),
    logoPositionX: z.number().min(0).max(1).nullish(),
    logoPositionY: z.number().min(0).max(1).nullish(),
  })
  .refine((data) => Boolean(data.textContent) || Boolean(data.logoId), {
    message: "Preset must have text content and/or a logo",
    path: ["textContent"],
  });

async function assertLogoOwnership(userId: string, logoId: string | null | undefined) {
  if (!logoId) return;
  const logo = await prisma.logo.findUnique({ where: { id: logoId } });
  if (!logo || logo.userId !== userId) throw new HttpError(400, "Logo not found");
}

export async function listPresets(req: Request, res: Response) {
  const presets = await prisma.preset.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ presets });
}

export async function getPreset(req: Request, res: Response) {
  const preset = await prisma.preset.findUnique({ where: { id: req.params.id as string } });
  if (!preset || preset.userId !== req.user!.id) throw new HttpError(404, "Preset not found");
  res.status(200).json({ preset });
}

export async function createPreset(req: Request, res: Response) {
  const data = presetSchema.parse(req.body);
  await assertLogoOwnership(req.user!.id, data.logoId);

  const preset = await prisma.preset.create({
    data: { ...data, userId: req.user!.id },
  });
  res.status(201).json({ preset });
}

export async function updatePreset(req: Request, res: Response) {
  const existing = await prisma.preset.findUnique({ where: { id: req.params.id as string } });
  if (!existing || existing.userId !== req.user!.id) throw new HttpError(404, "Preset not found");

  const data = presetSchema.parse(req.body);
  await assertLogoOwnership(req.user!.id, data.logoId);

  const preset = await prisma.preset.update({
    where: { id: existing.id },
    data,
  });
  res.status(200).json({ preset });
}

export async function deletePreset(req: Request, res: Response) {
  const existing = await prisma.preset.findUnique({ where: { id: req.params.id as string } });
  if (!existing || existing.userId !== req.user!.id) throw new HttpError(404, "Preset not found");

  await prisma.preset.delete({ where: { id: existing.id } });
  res.status(204).send();
}

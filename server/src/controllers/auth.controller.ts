import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { signAuthToken } from "../lib/jwt.js";
import { comparePassword, hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.middleware.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setAuthCookie(res: Response, userId: string) {
  res.cookie(env.COOKIE_NAME, signAuthToken(userId), cookieOptions);
}

export async function register(req: Request, res: Response) {
  const { email, password } = credentialsSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "Email already registered");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true },
  });

  setAuthCookie(res, user.id);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = credentialsSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(401, "Invalid email or password");

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new HttpError(401, "Invalid email or password");

  setAuthCookie(res, user.id);
  res.status(200).json({ user: { id: user.id, email: user.email } });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: cookieOptions.secure });
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  res.status(200).json({ user: req.user });
}

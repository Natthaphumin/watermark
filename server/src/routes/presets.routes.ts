import { Router } from "express";
import {
  createPreset,
  deletePreset,
  getPreset,
  listPresets,
  updatePreset,
} from "../controllers/presets.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const presetsRouter = Router();

presetsRouter.use(requireAuth);
presetsRouter.get("/", listPresets);
presetsRouter.post("/", createPreset);
presetsRouter.get("/:id", getPreset);
presetsRouter.put("/:id", updatePreset);
presetsRouter.delete("/:id", deletePreset);

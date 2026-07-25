import { Router } from "express";
import { deleteLogo, listLogos, uploadLogo } from "../controllers/logos.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { logoUpload } from "../middleware/upload.middleware.js";

export const logosRouter = Router();

logosRouter.use(requireAuth);
logosRouter.get("/", listLogos);
logosRouter.post("/", logoUpload.single("file"), uploadLogo);
logosRouter.delete("/:id", deleteLogo);

import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { historyRouter } from "./history.routes.js";
import { logosRouter } from "./logos.routes.js";
import { presetsRouter } from "./presets.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
apiRouter.use("/auth", authRouter);
apiRouter.use("/logos", logosRouter);
apiRouter.use("/presets", presetsRouter);
apiRouter.use("/history", historyRouter);

import { Router } from "express";
import { deleteHistory, listHistory, uploadHistory } from "../controllers/history.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { thumbnailUpload } from "../middleware/upload.middleware.js";

export const historyRouter = Router();

historyRouter.use(requireAuth);
historyRouter.get("/", listHistory);
historyRouter.post("/", thumbnailUpload.single("file"), uploadHistory);
historyRouter.delete("/:id", deleteHistory);

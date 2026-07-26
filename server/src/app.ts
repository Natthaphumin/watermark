import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { uploadsRoot } from "./middleware/upload.middleware.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/api/health" } }));
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(uploadsRoot));
app.use("/api", apiRouter);
app.use(errorMiddleware);

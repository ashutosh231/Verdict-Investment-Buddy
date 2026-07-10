import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import researchRoutes from "./routes/research.routes.js";
import marketRoutes from "./routes/market.routes.js";
import { corsOptions } from "./config/cors.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/public/market", marketRoutes);

app.use("/api", notFound);
app.use(errorHandler);

export default app;

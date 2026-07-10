import { Router } from "express";
import { trending, news, commodities } from "../controllers/marketController.js";

const router = Router();

// Public read-only market endpoints.
router.get("/trending", trending);
router.get("/news", news);
router.get("/commodities", commodities);

export default router;

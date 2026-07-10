import { Router } from "express";
import { research, history } from "../controllers/researchController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, research);
router.get("/history", requireAuth, history);

export default router;

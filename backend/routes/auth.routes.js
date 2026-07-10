import { Router } from "express";
import { signup, login, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { SignupSchema, LoginSchema, SIGNUP_ERROR, LOGIN_ERROR } from "../validators/auth.js";

const router = Router();

router.post("/signup", validateBody(SignupSchema, SIGNUP_ERROR), signup);
router.post("/login", validateBody(LoginSchema, LOGIN_ERROR), login);
router.get("/me", requireAuth, me);

export default router;

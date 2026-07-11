import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
  const { name, email: rawEmail, password } = req.validated;
  const email = rawEmail.toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, passwordHash });

  const userId = user._id.toString();
  const token = signToken({ sub: userId, email, name });
  return res.json({ token, user: { id: userId, email, name } });
});

export const login = asyncHandler(async (req, res) => {
  const { email: rawEmail, password } = req.validated;
  const email = rawEmail.toLowerCase();

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const userId = user._id.toString();
  const token = signToken({ sub: userId, email, name: user.name });
  return res.json({ token, user: { id: userId, email, name: user.name } });
});

export const me = asyncHandler(async (req, res) => {
  const { sub, email, name } = req.user;
  return res.json({ user: { id: sub, email, name } });
});

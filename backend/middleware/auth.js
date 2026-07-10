import { verifyToken } from "../utils/token.js";

/**
 * Require a valid Bearer token. Attaches { sub, email, name } to req.user.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = verifyToken(match[1]);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = user;
  next();
}

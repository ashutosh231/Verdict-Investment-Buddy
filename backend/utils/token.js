import jwt from "jsonwebtoken";

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Missing JWT_SECRET");
  return s;
}

/**
 * Sign a 7-day HS256 token. Payload mirrors the original app:
 * subject = user id, plus email and name claims.
 */
export function signToken({ sub, email, name }) {
  return jwt.sign({ email, name }, secret(), {
    subject: sub,
    expiresIn: "7d",
  });
}

/** Verify a token and normalize the payload, or return null. */
export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

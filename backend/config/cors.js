import { env } from "./env.js";

/** Parse comma-separated origins; `"*"` means allow any origin. */
function getAllowedOrigins() {
  const raw = (env.CORS_ORIGIN || "*").trim();
  if (raw === "*") return "*";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, allowed) {
  if (!origin) return true;
  if (allowed === "*") return true;
  if (allowed.includes(origin)) return true;

  // When a *.vercel.app production URL is listed, also allow other Vercel
  // preview deployments for the same project.
  const hasVercelOrigin = allowed.some((o) => o.includes(".vercel.app"));
  if (hasVercelOrigin && origin.endsWith(".vercel.app")) return true;

  // Render + Vercel deploys: allow Vercel frontends in production even if
  // CORS_ORIGIN was not updated from localhost-only defaults.
  if (env.NODE_ENV === "production" && origin.endsWith(".vercel.app")) return true;

  return false;
}

export const corsOptions = {
  origin(origin, callback) {
    const allowed = getAllowedOrigins();

    if (isOriginAllowed(origin, allowed)) {
      return callback(null, true);
    }

    console.warn(
      `CORS blocked origin "${origin}". Allowed: ${allowed === "*" ? "*" : allowed.join(", ")}`,
    );
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

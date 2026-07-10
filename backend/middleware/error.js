/** 404 handler for unmatched API routes. */
export function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

/** Centralized error handler. Maps agent/credit/rate errors to HTTP codes. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err?.message?.includes("not allowed by CORS")) {
    return res.status(403).json({ error: "Origin not allowed by CORS policy." });
  }

  console.error(err);
  const message = err instanceof Error ? err.message : "Something went wrong.";
  const status = err.status
    ? err.status
    : /credit|402/i.test(message)
      ? 402
      : /rate|429/i.test(message)
        ? 429
        : 500;
  res.status(status).json({ error: message });
}

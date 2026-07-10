/**
 * Validate req.body against a zod schema. On failure responds 400 with the
 * provided message and stores the parsed value on req.validated.
 */
export const validateBody = (schema, message) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: message });
  }
  req.validated = result.data;
  next();
};

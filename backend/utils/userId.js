/** Parse JWT subject into a numeric user id for relational queries. */
export function parseUserId(sub) {
  const id = Number.parseInt(String(sub), 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid user id");
  }
  return id;
}

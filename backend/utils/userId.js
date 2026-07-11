import mongoose from "mongoose";

/** Validate JWT subject as a MongoDB ObjectId string. */
export function parseUserId(sub) {
  const id = String(sub);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user id");
  }
  return id;
}

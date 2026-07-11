import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

const User = mongoose.model("User", userSchema);

export default User;

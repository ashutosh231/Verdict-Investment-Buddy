import mongoose from "mongoose";

const verdictSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      maxlength: 120,
    },
    decision: {
      type: String,
      enum: ["INVEST", "PASS"],
      default: null,
    },
    confidence: {
      type: Number,
      default: null,
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: null,
    },
    verdict: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

// Compound index for efficient user history queries (newest first)
verdictSchema.index({ userId: 1, createdAt: -1 });

const Verdict = mongoose.model("Verdict", verdictSchema);

export default Verdict;

import Verdict from "../models/Verdict.js";
import { runResearch } from "../services/investmentAgent.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseUserId } from "../utils/userId.js";
import { ResearchSchema, RESEARCH_ERROR } from "../validators/research.js";

export const research = asyncHandler(async (req, res) => {
  const result = ResearchSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: RESEARCH_ERROR });
  }
  const company = result.data.company;

  let verdict;
  try {
    verdict = await runResearch(company);
  } catch (err) {
    console.error("research agent error", err);
    const message = err instanceof Error ? err.message : "The research agent hit an error.";
    const status = /credit|402/i.test(message) ? 402 : /rate|429/i.test(message) ? 429 : 500;
    return res.status(status).json({ error: message });
  }

  // Persist the verdict for this user (best-effort).
  try {
    await Verdict.create({
      userId: parseUserId(req.user.sub),
      company: verdict.company,
      decision: verdict.decision,
      confidence: verdict.confidence,
      riskLevel: verdict.riskLevel,
      verdict,
    });
  } catch (persistErr) {
    console.error("verdict persist error", persistErr);
  }

  return res.json({ verdict });
});

export const history = asyncHandler(async (req, res) => {
  try {
    const rows = await Verdict.find({ userId: parseUserId(req.user.sub) })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const history = rows.map((r) => ({
      id: r._id.toString(),
      company: r.company,
      decision: r.decision,
      confidence: r.confidence,
      riskLevel: r.riskLevel,
      createdAt: r.createdAt,
      verdict: r.verdict ?? null,
    }));

    return res.json({ history });
  } catch (err) {
    console.error("history error", err);
    return res.json({ history: [] });
  }
});

import { z } from "zod";

export const ResearchSchema = z.object({
  company: z.string().trim().min(2).max(120),
});

export const RESEARCH_ERROR = "Please provide a company name.";

import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { getAIService } from "./aiService.js";
import { getLiveQuote } from "./finnhub.js";
import { getIndianStock } from "./indianStock.js";

/**
 * AI Investment Research Agent (LangGraph.js + AWS Bedrock).
 *
 * Flow: profile + financials + risks + structured data run concurrently,
 * then a decision node synthesizes a structured invest/pass call with full
 * reasoning and score breakdown.
 *
 * Uses AWS Bedrock with DeepSeek V3.2 model for cost-effective,
 * reliable AI-powered investment research.
 */

async function ask(temperature, system, user) {
  const aiService = getAIService();
  return aiService.generateWithSystem(system, user, temperature);
}

const ANALYST =
  "You are a rigorous, skeptical equity research analyst. Be concise, factual, and specific. Never fabricate exact figures you are unsure of — describe direction and magnitude instead.";

const StateAnnotation = Annotation.Root({
  company: Annotation,
  profile: Annotation,
  financials: Annotation,
  risks: Annotation,
  overview: Annotation,
  financialSeries: Annotation,
  news: Annotation,
  liveQuote: Annotation,
  marketData: Annotation,
  verdict: Annotation,
});

const toStrArr = (v) =>
  Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean).slice(0, 5) : [];

const clampScore = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));

async function profileNode(state) {
  const profile = await ask(
    0.3,
    ANALYST,
    `Give a tight research profile of "${state.company}". Cover: what it does, business model & how it makes money, sector, flagship products, market position vs competitors, and rough scale. 4-6 sentences.`,
  );
  return { profile };
}

async function financialsNode(state) {
  const financials = await ask(
    0.3,
    ANALYST,
    `Assess the financial picture of "${state.company}": revenue growth trend, profitability/margins, balance sheet strength, cash generation, and whether the valuation looks stretched or reasonable. 4-6 sentences.`,
  );
  return { financials };
}

async function risksNode(state) {
  const risks = await ask(
    0.4,
    ANALYST,
    `Identify the competitive moat (or lack of it), the top risks and threats, and the key industry tailwinds/headwinds for "${state.company}". 4-6 sentences.`,
  );
  return { risks };
}

async function livePriceNode(state) {
  const liveQuote = await getLiveQuote(state.company);
  return { liveQuote };
}

async function marketDataNode(state) {
  const marketData = await getIndianStock(state.company);
  return { marketData };
}

async function dataNode(state) {
  let overview = {
    oneLiner: "",
    sector: "—",
    headquarters: "—",
    founded: "—",
    employees: "—",
    ceo: "—",
  };
  let financialSeries = [];
  let news = [];

  try {
    const aiService = getAIService();
    const prompt = `For "${state.company}", produce structured reference data. Where exact figures are unknown, give your best reasonable estimate — approximate is fine and expected.

Respond with JSON:
{
  "overview": {
    "oneLiner": "<one punchy sentence on what they do>",
    "sector": "<industry/sector>",
    "headquarters": "<city, country>",
    "founded": "<year>",
    "employees": "<approx headcount, e.g. ~150,000>",
    "ceo": "<current CEO name>"
  },
  "financialSeries": [
    {"year": "<YYYY>", "revenue": <annual revenue in billions USD, number>, "netIncome": <net income in billions USD, number>}
  ],
  "news": [
    {"title": "<plausible recent headline>", "summary": "<1 sentence>", "sentiment": "positive|neutral|negative"}
  ]
}
Provide exactly 5 years of financialSeries (oldest to most recent) and exactly 3 news items.`;

    const system =
      "You are a rigorous, skeptical equity research analyst. Be concise, factual, and specific. Never fabricate exact figures you are unsure of — describe direction and magnitude instead. You always respond with a single valid JSON object and nothing else.";

    const parsed = await aiService.generateJSON(system, prompt, 0.3);

    const ov = parsed.overview ?? {};
    overview = {
      oneLiner: String(ov.oneLiner ?? ""),
      sector: String(ov.sector ?? "—"),
      headquarters: String(ov.headquarters ?? "—"),
      founded: String(ov.founded ?? "—"),
      employees: String(ov.employees ?? "—"),
      ceo: String(ov.ceo ?? "—"),
    };

    financialSeries = Array.isArray(parsed.financialSeries)
      ? parsed.financialSeries
          .map((p) => ({
            year: String(p.year ?? ""),
            revenue: Number(p.revenue) || 0,
            netIncome: Number(p.netIncome) || 0,
          }))
          .filter((p) => p.year)
          .slice(0, 6)
      : [];

    news = Array.isArray(parsed.news)
      ? parsed.news
          .map((n) => {
            const s = String(n.sentiment ?? "neutral").toLowerCase();
            const sentiment =
              s === "positive" ? "positive" : s === "negative" ? "negative" : "neutral";
            return {
              title: String(n.title ?? ""),
              summary: String(n.summary ?? ""),
              sentiment,
            };
          })
          .filter((n) => n.title)
          .slice(0, 4)
      : [];
  } catch (err) {
    console.error("dataNode parse error", err);
  }

  return { overview, financialSeries, news };
}

async function decideNode(state) {
  try {
    const aiService = getAIService();
    const prompt = `Using the research below, make a final call on "${state.company}".

PROFILE:
${state.profile}

FINANCIALS:
${state.financials}

RISKS & MOAT:
${state.risks}

Respond with JSON:
{
  "decision": "INVEST" or "PASS",
  "confidence": <integer 0-100>,
  "riskLevel": "LOW", "MEDIUM", or "HIGH",
  "thesis": "<2-3 sentence investment thesis justifying the decision>",
  "bullCase": ["<point>", "<point>", "<point>"],
  "bearCase": ["<point>", "<point>", "<point>"],
  "keyMetrics": [{"label": "<label>", "value": "<short assessment>"}],
  "scoreBreakdown": [
    {"label": "Moat", "score": <0-100>},
    {"label": "Growth", "score": <0-100>},
    {"label": "Financials", "score": <0-100>},
    {"label": "Valuation", "score": <0-100>},
    {"label": "Momentum", "score": <0-100>}
  ]
}`;

    const system =
      "You are a rigorous, skeptical equity research analyst. Be concise, factual, and specific. Never fabricate exact figures you are unsure of — describe direction and magnitude instead. Include 3-4 keyMetrics such as Moat, Growth, Valuation, Balance Sheet. Score each of the 5 scoreBreakdown categories from 0 (weak) to 100 (excellent).";

    const parsed = await aiService.generateJSON(system, prompt, 0.2);

    const decision = parsed.decision === "INVEST" ? "INVEST" : "PASS";
    const confidence = clampScore(parsed.confidence ?? 50);
    const riskLevel = ["LOW", "MEDIUM", "HIGH"].includes(parsed.riskLevel)
      ? parsed.riskLevel
      : "MEDIUM";

    const scoreBreakdown = Array.isArray(parsed.scoreBreakdown)
      ? parsed.scoreBreakdown
          .map((s) => ({ label: String(s.label ?? ""), score: clampScore(s.score) }))
          .filter((s) => s.label)
          .slice(0, 6)
      : [];

    // Prefer real market data (₹ crore) for the financial series when available.
    const realSeries =
      state.marketData?.financialSeries?.map((f) => ({
        year: f.year,
        revenue: f.revenue,
        netIncome: f.netIncome,
      })) ?? [];

    // Merge real news headlines in front of AI-estimated ones.
    const realNews =
      state.marketData?.news?.slice(0, 3).map((n) => ({
        title: n.title,
        summary: n.date ? `Reported ${n.date}` : "Recent market news",
        sentiment: "neutral",
      })) ?? [];

    const verdict = {
      company: state.company,
      decision,
      confidence,
      riskLevel,
      thesis: String(parsed.thesis ?? ""),
      bullCase: toStrArr(parsed.bullCase),
      bearCase: toStrArr(parsed.bearCase),
      keyMetrics: Array.isArray(parsed.keyMetrics)
        ? parsed.keyMetrics
            .map((m) => ({ label: String(m.label ?? ""), value: String(m.value ?? "") }))
            .filter((m) => m.label && m.value)
            .slice(0, 6)
        : [],
      scoreBreakdown,
      overview: state.marketData
        ? {
            oneLiner: state.marketData.description.split(". ")[0] || state.overview?.oneLiner || "",
            sector: state.marketData.industry || state.overview?.sector || "—",
            headquarters: state.overview?.headquarters ?? "India",
            founded: state.overview?.founded ?? "—",
            employees: state.overview?.employees ?? "—",
            ceo: state.overview?.ceo ?? "—",
          }
        : state.overview ?? {
            oneLiner: "",
            sector: "—",
            headquarters: "—",
            founded: "—",
            employees: "—",
            ceo: "—",
          },
      financialSeries: realSeries.length > 0 ? realSeries : state.financialSeries ?? [],
      news: realNews.length > 0 ? realNews : state.news ?? [],
      liveQuote: state.liveQuote ?? null,
      marketData: state.marketData ?? null,
      research: {
        profile: state.profile,
        financials: state.financials,
        risks: state.risks,
      },
    };

    return { verdict };
  } catch (err) {
    console.error("decideNode error", err);
    throw err;
  }
}

const graph = new StateGraph(StateAnnotation)
  .addNode("gatherProfile", profileNode)
  .addNode("analyzeFinancials", financialsNode)
  .addNode("assessRisks", risksNode)
  .addNode("gatherData", dataNode)
  .addNode("gatherLivePrice", livePriceNode)
  .addNode("gatherMarketData", marketDataNode)
  .addNode("decide", decideNode)
  // Fan out: run the research passes concurrently...
  .addEdge(START, "gatherProfile")
  .addEdge(START, "analyzeFinancials")
  .addEdge(START, "assessRisks")
  .addEdge(START, "gatherData")
  .addEdge(START, "gatherLivePrice")
  .addEdge(START, "gatherMarketData")
  // ...then fan in: decide runs once all research completes.
  .addEdge("gatherProfile", "decide")
  .addEdge("analyzeFinancials", "decide")
  .addEdge("assessRisks", "decide")
  .addEdge("gatherData", "decide")
  .addEdge("gatherLivePrice", "decide")
  .addEdge("gatherMarketData", "decide")
  .addEdge("decide", END)
  .compile();

export async function runResearch(company) {
  const clean = company.trim().slice(0, 120);
  const result = await graph.invoke({
    company: clean,
    financialSeries: [],
    news: [],
    overview: null,
    liveQuote: null,
    marketData: null,
    verdict: null,
  });
  if (!result.verdict) throw new Error("Agent failed to produce a verdict");
  return result.verdict;
}

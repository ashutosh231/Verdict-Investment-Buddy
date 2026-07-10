import "dotenv/config";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * AWS Bedrock AI Service
 * Provides unified interface for AI requests using DeepSeek V3.2 via Amazon Bedrock.
 * Replaces Gemini integration with AWS Bedrock for better reliability and cost efficiency.
 */

class BedrockAIService {
  constructor() {
    const region = process.env.AWS_REGION || "us-east-1";
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const modelId = process.env.BEDROCK_MODEL_ID || "deepseek.v3.2";

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("Missing AWS credentials: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY required");
    }

    this.client = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.modelId = modelId;
    this.maxRetries = 3;
    this.retryDelayMs = 1000;
  }

  /**
   * Execute request with exponential backoff retry logic.
   * Handles transient AWS errors gracefully.
   */
  async executeWithRetry(command, attempt = 0) {
    try {
      return await this.client.send(command);
    } catch (error) {
      // Retry on transient errors (throttling, timeout, service unavailable)
      const isTransient =
        error.name === "ThrottlingException" ||
        error.name === "ServiceUnavailableException" ||
        error.name === "RequestTimeoutException" ||
        error.$metadata?.httpStatusCode === 429 ||
        error.$metadata?.httpStatusCode === 503 ||
        error.$metadata?.httpStatusCode === 504;

      if (isTransient && attempt < this.maxRetries) {
        const delayMs = this.retryDelayMs * Math.pow(2, attempt);
        console.warn(
          `Bedrock request failed (attempt ${attempt + 1}/${this.maxRetries}). Retrying in ${delayMs}ms...`,
          error.message
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.executeWithRetry(command, attempt + 1);
      }

      // Log error without exposing sensitive data
      const errorMsg = error.message || "Unknown Bedrock error";
      console.error(`Bedrock error: ${errorMsg}`);
      throw new Error(`AI service error: ${errorMsg}`);
    }
  }

  /**
   * Generate a response from the AI model.
   * @param {string} prompt - The prompt to send to the model
   * @param {number} temperature - Temperature for randomness (0-1)
   * @returns {Promise<string>} - The model's response
   */
  async generateResponse(prompt, temperature = 0.7) {
    const command = new ConverseCommand({
      modelId: this.modelId,
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        temperature: Math.max(0, Math.min(1, temperature)),
        maxTokens: 2048,
      },
    });

    const response = await this.executeWithRetry(command);
    const textContent = response.output.message.content.find((c) => c.text);
    if (!textContent || !textContent.text) {
      throw new Error("No text response from Bedrock model");
    }
    return textContent.text;
  }

  /**
   * Generate a response with system prompt (instruction following).
   * @param {string} system - System prompt
   * @param {string} user - User prompt
   * @param {number} temperature - Temperature for randomness
   * @returns {Promise<string>} - The model's response
   */
  async generateWithSystem(system, user, temperature = 0.7) {
    const fullPrompt = `${system}\n\nUser: ${user}`;
    return this.generateResponse(fullPrompt, temperature);
  }

  /**
   * Generate structured JSON response.
   * Ensures response is valid JSON.
   * @param {string} system - System prompt
   * @param {string} user - User prompt
   * @param {number} temperature - Temperature for randomness
   * @returns {Promise<object>} - Parsed JSON object
   */
  async generateJSON(system, user, temperature = 0.2) {
    const systemWithJson = `${system}
    
You MUST respond with ONLY valid JSON (no markdown, no extra text). Start with { and end with }.`;

    const response = await this.generateWithSystem(systemWithJson, user, temperature);

    // Extract JSON from response (handles markdown code blocks)
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;

    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse JSON response:", response);
      throw new Error("Invalid JSON response from AI model");
    }
  }

  /**
   * Analyze investment data and return structured verdict.
   * @param {object} data - Investment analysis data
   * @returns {Promise<object>} - Verdict with decision, confidence, etc.
   */
  async analyzeInvestment(data) {
    const { company, profile, financials, risks } = data;

    const prompt = `Using the research below, make a final call on "${company}".

PROFILE:
${profile}

FINANCIALS:
${financials}

RISKS & MOAT:
${risks}

Respond with a JSON object containing:
{
  "decision": "INVEST" or "PASS",
  "confidence": <integer 0-100>,
  "riskLevel": "LOW", "MEDIUM", or "HIGH",
  "thesis": "<2-3 sentence investment thesis>",
  "bullCase": ["<point>", "<point>", "<point>"],
  "bearCase": ["<point>", "<point>", "<point>"],
  "keyMetrics": [{"label": "<label>", "value": "<assessment>"}],
  "scoreBreakdown": [
    {"label": "Moat", "score": <0-100>},
    {"label": "Growth", "score": <0-100>},
    {"label": "Financials", "score": <0-100>},
    {"label": "Valuation", "score": <0-100>},
    {"label": "Momentum", "score": <0-100>}
  ]
}`;

    const system = `You are a rigorous, skeptical equity research analyst. Be concise, factual, and specific. Never fabricate exact figures you are unsure of — describe direction and magnitude instead.`;

    return this.generateJSON(system, prompt, 0.2);
  }

  /**
   * Summarize a report or text.
   * @param {string} text - Text to summarize
   * @param {number} maxLength - Max length of summary
   * @returns {Promise<string>} - Summary
   */
  async summarizeReport(text, maxLength = 500) {
    const prompt = `Summarize the following report in ${maxLength} characters or less:

${text}

Provide only the summary, no extra text.`;

    const system =
      "You are an expert financial analyst. Provide concise, accurate summaries of financial documents.";
    return this.generateWithSystem(system, prompt, 0.3);
  }

  /**
   * Extract and normalize company data.
   * @param {string} company - Company name
   * @returns {Promise<object>} - Normalized company data
   */
  async extractCompanyData(company) {
    const prompt = `For "${company}", provide structured reference data. Where exact figures are unknown, give your best reasonable estimate.

Respond with JSON:
{
  "overview": {
    "oneLiner": "<one punchy sentence>",
    "sector": "<industry/sector>",
    "headquarters": "<city, country>",
    "founded": "<year>",
    "employees": "<approx headcount>",
    "ceo": "<current CEO name>"
  },
  "financialSeries": [
    {"year": "<YYYY>", "revenue": <billions USD>, "netIncome": <billions USD>}
  ],
  "news": [
    {"title": "<headline>", "summary": "<1 sentence>", "sentiment": "positive|neutral|negative"}
  ]
}
Provide exactly 5 years of financialSeries (oldest to most recent) and exactly 3 news items.`;

    const system =
      "You are a rigorous, skeptical equity research analyst. Be concise, factual, and specific. Never fabricate exact figures you are unsure of — describe direction and magnitude instead. You always respond with a single valid JSON object and nothing else.";

    return this.generateJSON(system, prompt, 0.3);
  }
}

// Singleton instance
let serviceInstance = null;

export function getAIService() {
  if (!serviceInstance) {
    serviceInstance = new BedrockAIService();
  }
  return serviceInstance;
}

export { BedrockAIService };

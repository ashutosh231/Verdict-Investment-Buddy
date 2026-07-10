import "dotenv/config";

/**
 * Central environment access. Reads from process.env (populated by dotenv).
 * Now configured for AWS Bedrock with DeepSeek V3.2.
 */
export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
  INDIAN_STOCK_API_KEY: process.env.INDIAN_STOCK_API_KEY,
  // AWS Bedrock Configuration
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || "deepseek.v3.2",
};

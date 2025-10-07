export const config = {
  aiSdk: {
    baseUrl: process.env.AI_BASE_URL || "https://openrouter.ai/api/v1",
    apiKey: process.env.AI_API_KEY || "",
    model: process.env.AI_MODEL || "anthropic/claude-sonnet-4",
  },
} as const;

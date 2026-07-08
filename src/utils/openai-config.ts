import { OpenAIClient } from "@anvia/openai";

interface ClientConfig {
  apiKey: string;
}

const baseUrl = "https://ai.devscale.id/api/v1";

export function getClient({ apiKey }: ClientConfig) {
  return new OpenAIClient({
    apiKey,
    baseUrl,
  });
}

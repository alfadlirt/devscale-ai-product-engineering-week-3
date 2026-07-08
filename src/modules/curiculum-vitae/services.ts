import { AgentBuilder, createCompletion } from "@anvia/core";
import { getClient } from "../../utils/openai-config.js";

export async function generateMarkdown(context: string, instructions: string) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
  const MODEL = "glm-5.2";

  const client = getClient({ apiKey: OPENAI_API_KEY });
  const model = client.completionModel(MODEL);
  const response = await createCompletion(model, {
    instructions,
    input: context,
    maxTokens: 3000,
  });

  return response.text;
}

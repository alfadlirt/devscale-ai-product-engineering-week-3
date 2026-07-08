import { createParsedCompletion } from "@anvia/core";
import TurndownService from "turndown";
import { getClient } from "../../utils/openai-config.js";
import { getCompareCvPrompt, getExtractJobPrompt } from "./prompts.js";
import { JobType } from "../../generated/prisma/client.js";
import {
  CvMatchSchema,
  ExtractedJobSchema,
  type CvMatch,
  type ExtractedJob,
} from "./schema.js";

const turndown = new TurndownService();
turndown.remove(["script", "style", "noscript"]);

function getGptModel() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
  const client = getClient({ apiKey: OPENAI_API_KEY });
  return client.completionModel("gpt-5.5");
}

export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html).trim();
}

export async function extractStructuredJob(
  jobMarkdown: string,
): Promise<ExtractedJob> {
  const response = await createParsedCompletion(getGptModel(), {
    instructions: getExtractJobPrompt(new Date().toISOString()),
    input: jobMarkdown,
    schema: ExtractedJobSchema,
  });

  return response.data;
}

export async function compareJobWithCv(
  jobMarkdown: string,
  cvContent: string,
  userContext: string,
): Promise<CvMatch> {
  const response = await createParsedCompletion(getGptModel(), {
    instructions: getCompareCvPrompt(new Date().toISOString(), userContext),
    input: `<cv>\n${cvContent}\n</cv>\n\n<job_posting>\n${jobMarkdown}\n</job_posting>\n\n`,
    schema: CvMatchSchema,
  });

  return response.data;
}

import { Worker } from "bullmq";
import {
  CONVERT_TO_MARKDOWN_QUEUE_NAME,
  JOB_ANALYZE_QUEUE_NAME,
  connection,
} from "./utils/queue-config.js";
import "dotenv/config";
import { prisma } from "./utils/prisma.js";
import { generateMarkdown } from "./modules/curiculum-vitae/services.js";
import { getConvertToMarkdownPrompt } from "./modules/curiculum-vitae/prompts.js";
import { PDFParse } from "pdf-parse";
import type { JobAnalyzeJobData } from "./modules/job-analyzer/schema.js";
import { JobType, JobAnalyzerResultStatus } from "./generated/prisma/client.js";
import {
  compareJobWithCv,
  extractStructuredJob,
  htmlToMarkdown,
} from "./modules/job-analyzer/services.js";

interface ConvertToMarkdownJobData {
  key: string;
  filePath: string;
  content: string | null;
}

export const convertToMarkdownWorker = new Worker<ConvertToMarkdownJobData>(
  CONVERT_TO_MARKDOWN_QUEUE_NAME,
  async (job) => {
    const { key, filePath } = job.data;

    try {
      console.log(`[convert-to-markdown ${key}] reading ${filePath}`);

      const parser = new PDFParse({ url: filePath });
      const pdfText = await parser.getText();

      console.log(`[convert-to-markdown ${key}] converting to markdown`);
      const markdown = await generateMarkdown(
        pdfText.text,
        getConvertToMarkdownPrompt(new Date().toISOString()),
      );

      console.log(`[convert-to-markdown ${key}] saving result`);
      await prisma.curiculumVitae.upsert({
        where: { key },
        create: { key, content: markdown, isActive: true },
        update: { content: markdown, isActive: true },
      });

      console.log(`[convert-to-markdown ${key}] done`);
    } catch (error) {
      console.error(`[convert-to-markdown ${key}] failed`, error);
      await prisma.curiculumVitae
        .upsert({
          where: { key },
          create: { key, content: null, isActive: false },
          update: { isActive: false },
        })
        .catch(() => {});
      throw error;
    }
  },
  { connection },
);

const normalize = (value: string) =>
  value.trim().toUpperCase() === "NONE" ? null : value;

export const jobAnalyzerWorker = new Worker<JobAnalyzeJobData>(
  JOB_ANALYZE_QUEUE_NAME,
  async (job) => {
    const { jobPostingUrls, cvId, userContext } = job.data;

    const expectedMinimumUSDAnnualSalary =
      userContext.preferences.minimumAnnualSalaryUSD ?? null;
    const expectedLocation =
      userContext.preferences.preferredLocations?.join(", ") ?? null;
    const expectedType =
      userContext.preferences.expectedEmploymentTypes?.[0] ?? null;

    const userContextString = JSON.stringify(userContext, null, 2);

    const cv = await prisma.curiculumVitae.findUnique({ where: { id: cvId } });
    if (!cv?.content) {
      throw new Error(`CV ${cvId} not found or has no content`);
    }

    for (const jobPostingUrl of jobPostingUrls) {
      console.log(`[job-analyzer cv:${cvId}] start ${jobPostingUrl}`);

      const result = await prisma.jobAnalyzerResult.upsert({
        where: {
          curiculumVitaeId_jobPostingUrl: {
            curiculumVitaeId: cvId,
            jobPostingUrl,
          },
        },
        create: {
          curiculumVitaeId: cvId,
          jobPostingUrl,
          status: JobAnalyzerResultStatus.PENDING,
          expectedMinimumUSDAnnualSalary,
          expectedLocation,
          expectedType,
        },
        update: {
          status: JobAnalyzerResultStatus.PENDING,
          expectedMinimumUSDAnnualSalary,
          expectedLocation,
          expectedType,
        },
      });

      try {
        console.log(`[job-analyzer cv:${cvId}] fetching html`);
        const response = await fetch(jobPostingUrl);
        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }
        const html = await response.text();

        console.log(`[job-analyzer cv:${cvId}] converting to markdown`);
        const jobMarkdown = htmlToMarkdown(html);

        console.log(`[job-analyzer cv:${cvId}] extracting structured job`);
        const extracted = await extractStructuredJob(jobMarkdown);

        console.log(`[job-analyzer cv:${cvId}] comparing with cv`);
        const match = await compareJobWithCv(
          jobMarkdown,
          cv.content,
          userContextString,
        );

        console.log(`[job-analyzer cv:${cvId}] saving result`);
        await prisma.jobAnalyzerResult.update({
          where: { id: result.id },
          data: {
            companyName: normalize(extracted.companyName),
            position: normalize(extracted.position),
            salary: normalize(extracted.salary),
            description: normalize(extracted.description),
            location: normalize(extracted.location),
            type: extracted.type as JobType,
            requirementMatch: match.requirementMatch,
            experienceMatch: match.experienceMatch,
            educationMatch: match.educationMatch,
            salaryExpectationMatch: match.salaryExpectationMatch,
            skillsMatch: match.skillsMatch,
            certificationsMatch: match.certificationsMatch,
            languagesMatch: match.languagesMatch,
            confidence: match.confidence,
            suggestedAction: match.suggestionAction,
            note: match.note,
            coverLetter: match.coverLetter,
            status: JobAnalyzerResultStatus.COMPLETED,
          },
        });

        console.log(`[job-analyzer cv:${cvId}] done ${jobPostingUrl}`);
      } catch (error) {
        console.error(
          `[job-analyzer cv:${cvId}] failed ${jobPostingUrl}`,
          error,
        );
        await prisma.jobAnalyzerResult
          .update({
            where: { id: result.id },
            data: { status: JobAnalyzerResultStatus.FAILED },
          })
          .catch(() => {});
      }
    }
  },
  { connection },
);

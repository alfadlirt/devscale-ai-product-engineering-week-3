import { z } from "zod";
import { JobType, SuggestionAction } from "../../generated/prisma/client.js";

export const UserPreferencesSchema = z.object({
  minimumAnnualSalaryUSD: z.number().min(0).optional(),
  targetAnnualSalaryUSD: z
    .object({ min: z.number().min(0), max: z.number().min(0) })
    .optional(),
  preferredLocations: z.array(z.string()).optional(),
  expectedEmploymentTypes: z.array(z.string()).optional(),
  preferredTimezone: z.string().optional(),
});

export const UserContextSchema = z.object({
  preferences: UserPreferencesSchema,
  careerGoals: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
});

export type UserContext = z.infer<typeof UserContextSchema>;

export const JobAnalyzerRequestSchema = z.object({
  jobPostingUrls: z.array(z.string()).min(1),
  cvId: z.number().int().positive(),
  userContext: UserContextSchema,
});

export type JobAnalyzerRequest = z.infer<typeof JobAnalyzerRequestSchema>;

export interface JobAnalyzeJobData {
  jobPostingUrls: string[];
  cvId: number;
  userContext: UserContext;
}

export const ExtractedJobSchema = z.object({
  companyName: z
    .string()
    .describe("Hiring company name. Use 'NONE' if not stated."),
  position: z
    .string()
    .describe("Job title / position. Use 'NONE' if not stated."),
  salary: z
    .string()
    .describe(
      "Salary or compensation range exactly as written. Use 'NONE' if not stated.",
    ),
  description: z
    .string()
    .describe(
      "Concise summary of the role, responsibilities and requirements.",
    ),
  location: z
    .string()
    .describe(
      "Work location (city/country or 'Remote'). Use 'NONE' if not stated.",
    ),
  type: z
    .enum(Object.values(JobType))
    .describe("Employment type. Best guess FULL_TIME if not stated."),
});

export type ExtractedJob = z.infer<typeof ExtractedJobSchema>;

const matchScore = (label: string) =>
  z
    .number()
    .min(0)
    .max(1)
    .describe(
      `${label} match score between 0 (no match) and 1 (perfect match).`,
    );

export const CvMatchSchema = z.object({
  expectedMinimumUSDAnnualSalaryMatch: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Expected minimum USD annual salary match score between 0 (no match) and 1 (perfect match).",
    ),
  expectedLocationMatch: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Expected location match score between 0 (no match) and 1 (perfect match).",
    ),
  expectedTypesMatch: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Expected types match score between 0 (no match) and 1 (perfect match).",
    ),
  requirementMatch: matchScore("Overall job requirements"),
  experienceMatch: matchScore("Work experience"),
  educationMatch: matchScore("Education background"),
  salaryExpectationMatch: matchScore("Salary expectation"),
  skillsMatch: matchScore("Skills"),
  certificationsMatch: matchScore("Certifications"),
  languagesMatch: matchScore("Languages"),

  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall confidence that the candidate is a good fit (0-1)."),
  suggestionAction: z
    .enum(Object.values(SuggestionAction))
    .describe("Suggested action to take based on the match scores."),
  note: z
    .string()
    .describe(
      "A note to the user about the match scores and suggested action.",
    ),
  coverLetter: z
    .string()
    .describe(
      "A short, tailored cover letter drafted for this candidate and job. Only fill if confidence score is > 0.7",
    ),
});

export type CvMatch = z.infer<typeof CvMatchSchema>;

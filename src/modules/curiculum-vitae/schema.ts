import { z } from "zod";
import { JobType } from "../../generated/prisma/client.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const CVRequestFormSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, "key must be alphanumeric (- and _ allowed)"),
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, "File is empty")
    .refine((f) => f.size <= MAX_FILE_SIZE, "File exceeds 10MB limit")
    .refine((f) => f.type === "application/pdf", "Only PDF files are accepted"),
});

export type CVRequestForm = z.infer<typeof CVRequestFormSchema>;

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { JobAnalyzerRequestSchema } from "./schema.js";
import { jobAnalyzeQueue } from "../../utils/queue.js";
import { prisma } from "../../utils/prisma.js";
import { JOB_ANALYZE_QUEUE_NAME } from "../../utils/queue-config.js";

export const jobAnalyzerRouter = new Hono()
  .get("/", async (c) => {
    const jobAnalyzerResults = await prisma.jobAnalyzerResult.findMany();
    return c.json(jobAnalyzerResults);
  })
  .post(
    "/by-job-posting",
    zValidator("json", JobAnalyzerRequestSchema),
    async (c) => {
      const body = c.req.valid("json");

      await jobAnalyzeQueue.add(JOB_ANALYZE_QUEUE_NAME, {
        jobPostingUrls: body.jobPostingUrls,
        cvId: body.cvId,
        userContext: body.userContext,
      });

      return c.json({ message: "Job analyzer is on queue" });
    },
  );

import type { ConnectionOptions } from "bullmq";

export const CONVERT_TO_MARKDOWN_QUEUE_NAME = "convert-to-markdown";
export const JOB_ANALYZE_QUEUE_NAME = "job-analyze";

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
};

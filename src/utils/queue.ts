import { Queue } from "bullmq";
import {
  connection,
  CONVERT_TO_MARKDOWN_QUEUE_NAME,
  JOB_ANALYZE_QUEUE_NAME,
} from "./queue-config.js";

export const convertToMarkdownQueue = new Queue(
  CONVERT_TO_MARKDOWN_QUEUE_NAME,
  { connection },
);

export const jobAnalyzeQueue = new Queue(JOB_ANALYZE_QUEUE_NAME, {
  connection,
});

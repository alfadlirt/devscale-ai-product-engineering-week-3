import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { curiculumVitaeRouter } from "./modules/curiculum-vitae/router.js";
import { jobAnalyzerRouter } from "./modules/job-analyzer/router.js";

const app = new Hono()
  .route("/curiculum-vitae", curiculumVitaeRouter)
  .route("/job-analyzer", jobAnalyzerRouter);

serve(
  {
    fetch: app.fetch,
    port: 8000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

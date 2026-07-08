import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CVRequestFormSchema } from "./schema.js";
import { convertToMarkdownQueue } from "../../utils/queue.js";
import { prisma } from "../../utils/prisma.js";
import { saveCvFile } from "../../utils/upload-file.js";
import { CONVERT_TO_MARKDOWN_QUEUE_NAME } from "../../utils/queue-config.js";

export const curiculumVitaeRouter = new Hono()
  .get("/", async (c) => {
    const data = await prisma.curiculumVitae.findMany();
    return c.json(data);
  })
  .post("/", zValidator("form", CVRequestFormSchema), async (c) => {
    const { key, file } = c.req.valid("form");

    let filePath: string;
    try {
      filePath = await saveCvFile(file, key);
    } catch (err) {
      return c.json({ message: (err as Error).message }, 400);
    }

    const data = await prisma.curiculumVitae.create({
      data: {
        key,
        content: "",
      },
    });

    await convertToMarkdownQueue.add(CONVERT_TO_MARKDOWN_QUEUE_NAME, {
      key,
      filePath,
      content: null,
    });

    return c.json({
      message: "Curiculum vitae conversion is on queue",
      curiculumVitaeId: data.id,
    });
  });

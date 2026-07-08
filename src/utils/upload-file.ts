import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

const PDF_MAGIC = Buffer.from("%PDF");

export async function saveCvFile(file: File, key: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());

  if (!bytes.subarray(0, 4).equals(PDF_MAGIC)) {
    throw new Error("File content is not a valid PDF");
  }

  const tempPath = path.join(UPLOAD_DIR, `${randomUUID()}.tmp`);
  const finalPath = path.join(UPLOAD_DIR, `${key}.pdf`);

  await writeFile(tempPath, bytes);

  try {
    await rename(tempPath, finalPath);
  } catch (err) {
    await unlink(tempPath).catch(() => {});
    throw err;
  }

  return finalPath;
}

import { default as JSZip } from "jszip";
import PQueue from "p-queue";

export const rawUrl = (test262: string) =>
  new URL(test262, import.meta.env.VITE_TEST262_RAW_URL).href;

async function downloadFile(path: string): Promise<Blob> {
  const response = await fetch(rawUrl(path));
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
  const blob = await response.blob();
  return blob;
}

export async function handleDownload(paths: string[]) {
  const zip = new JSZip();
  let succeeded = 0;
  let failed = 0;
  const failedPaths: { path: string; error: string }[] = [];

  await concurrency.enqueue(
    10,
    paths.map((path) => async () => {
      try {
        const fileBlob = await downloadFile(path);
        zip.file(path, fileBlob);
        succeeded++;
      } catch (error) {
        failed++;
        failedPaths.push({
          path,
          error: error instanceof Error ? error.message : String(error),
        });
        logger.error(`Failed (${failed}): ${path}`);
      }
    }),
  );

  if (failedPaths.length > 0) {
    const errorLog = failedPaths
      .map((item) => `${item.path}: ${item.error}`)
      .join("\n");
    zip.file("_errors.log", errorLog);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(zipBlob);
  link.download = "files.zip";
  link.click();
}

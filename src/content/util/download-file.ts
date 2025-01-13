import { default as JSZip } from "jszip";
import PQueue from "p-queue";
import { rawUrl } from "@/content/Visualizer/Test262Viewer.tsx";

async function downloadFile(path: string): Promise<Blob> {
  const response = await fetch(rawUrl(path));
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
  const blob = await response.blob();
  return blob;
}

export async function handleDownload(paths: string[]) {
  console.log("!");
  const zip = new JSZip();
  const queue = new PQueue({ concurrency: 10 }); // 동시에 5개씩 처리
  console.log("!");

  let succeeded = 0;
  let failed = 0;
  const failedPaths: { path: string; error: string }[] = [];

  for (const path of paths) {
    queue.add(async () => {
      try {
        const fileBlob = await downloadFile(path);
        zip.file(path, fileBlob);
        succeeded++;
        console.log(`Success (${succeeded}/${paths.length}): ${path}`);
      } catch (error) {
        failed++;
        failedPaths.push({
          path,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`Failed (${failed}): ${path}`);
      }
    });
  }

  await queue.onIdle();

  if (failedPaths.length > 0) {
    const errorLog = failedPaths
      .map((item) => `${item.path}: ${item.error}`)
      .join("\n");
    zip.file("_errors.log", errorLog); // 실패 로그를 ZIP 파일에 추가
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(zipBlob);
  link.download = "files.zip";
  link.click();
}

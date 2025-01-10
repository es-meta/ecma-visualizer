import { DownloadIcon } from "lucide-react";
import { useState } from "react";

const rawUrl = (test262: string) =>
  `https://raw.githubusercontent.com/tc39/test262/3a7a72aef5009eb22117231d40f9a5a66a9a595a/test/${test262}`;

const url = (test262: string) =>
  `https://github.com/tc39/test262/blob/3a7a72aef5009eb22117231d40f9a5a66a9a595a/test/${test262}`;

const fileName = (test262: string) => {
  const nameStr = test262.split("/");
  return nameStr[nameStr.length - 1];
};

// const BATCH_SIZE = 5;

const Test262Viewer = ({
  selectedTest262Set,
}: {
  selectedTest262Set: string[];
}) => {
  // const [selectedIdx, setSelectedIdx] = useState<number>(0);
  // const [test262, setTest262] = useState<string>("");
  const [loading, setLoading] = useState(false);
  // const [batchLoading, setBatchLoading] = useState(false);

  const downloadFile = async (
    filePath: string,
    fileName: string,
    withOutLoading: boolean = false,
  ) => {
    if (!withOutLoading) setLoading(true);
    try {
      const response = await fetch(filePath);
      const text = await response.text();

      const blob = new Blob([text], { type: "text/javascript" });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error(`failed to download ${fileName} ${filePath}`, e);
    } finally {
      if (!withOutLoading) setLoading(false);
    }
  };

  // async function downloadAll() {
  // const zip = new JSZip();
  // selectedTest262Set.map(async (test262: string) => {});

  // setBatchLoading(true);
  // for (let i = 0; i < selectedTest262Set.length; i += 1) {
  //   // const batch = selectedTest262Set.slice(i, i + BATCH_SIZE);
  //   // const batchPromises = batch.map((test262) =>
  //   //   downloadFile(rawUrl(test262), fileName(test262), true),
  //   // );
  //   // await Promise.all(batchPromises);
  // }
  // // const downloadPromise = selectedTest262Set.map((test262) =>
  // //   downloadFile(rawUrl(test262), fileName(test262), true),
  // // );
  // // await Promise.all(downloadPromise);
  // setBatchLoading(false);
  // }

  return (
    <div className="m-0 flex flex-col gap-1 overflow-scroll p-3">
      {/*<button onClick={() => downloadAll()}>Download All</button>*/}
      {loading && <div>Downloading..</div>}
      {selectedTest262Set.map((test262) => (
        <div className="flex flex-row text-sm">
          <a href={url(test262)} target="_blank">
            {test262}
          </a>
          <button
            onClick={() => downloadFile(rawUrl(test262), fileName(test262))}
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Test262Viewer;

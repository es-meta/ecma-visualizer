import {
  DownloadIcon,
  FlaskConicalIcon,
  FolderDownIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { SDOWaiting } from "./ProgramViewer";
import { useAtomValue } from "jotai";
import { test262Atom } from "../atoms/app";
import { handleDownload } from "../util/download-file";

// TODO Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.eslint(react-refresh/only-export-components)
export const rawUrl = (test262: string) =>
  `${import.meta.env.VITE_TEST262_RAW_URL}/${test262}`;

const url = (test262: string) =>
  `${import.meta.env.VITE_TEST262_URL}/${test262}`;

const fileName = (test262: string) => {
  const nameStr = test262.split("/");
  return nameStr[nameStr.length - 1];
};

const Test262ViewerContent = ({
  test262,
  rowVirtualizer,
  // loading,
  // error,
  sdoWaiting,
}: {
  test262: string[];
  rowVirtualizer: Virtualizer<Element, Element>;
  // loading: boolean;
  // error: CustomError | null;
  sdoWaiting: boolean;
}) => {
  const downloadFile = async (filePath: string, fileName: string) => {
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
    }
  };

  return sdoWaiting ? (
    <SDOWaiting />
  ) : (
    // ) : loading ? (
    //   <Loading />
    // ) : error ? (
    //   <Error error={error} />
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {rowVirtualizer.getVirtualItems().map((vi) => {
        const test = test262[vi.index];
        return (
          <div
            key={vi.key}
            className="flex w-full flex-auto flex-row items-center justify-center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${vi.size}px`,
              transform: `translateY(${vi.start}px)`,
            }}
          >
            <div className="flex-1 truncate px-2 text-sm">
              <a href={url(test)} target="_blank">
                {test}
              </a>
            </div>
            <div className="px-1 text-center">
              <button
                className="group inline cursor-pointer rounded-sm hover:bg-blue-600"
                onClick={() => downloadFile(rawUrl(test), fileName(test))}
              >
                <DownloadIcon className="h-4 w-4 group-hover:text-white" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function Test262262Viewer() {
  const test262 = useAtomValue(test262Atom);

  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: test262 ? test262.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
  });

  const [downloading, setDownloading] = useState(false);
  const downloadAll = () => {
    if (test262 === null) return;

    setDownloading(true);
    if (downloading) {
      alert("Download is already in progress.");
      return;
    }

    (async () => {
      try {
        await handleDownload(test262);
      } catch (error) {
        console.error("Download failed:", error);
      } finally {
        setDownloading(false);
      }
    })();
  };

  return (
    <>
      <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
        <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300 [&>svg]:size-4">
          <FlaskConicalIcon />
          Test262
        </div>

        <div className="flex flex-row items-center gap-1">
          <div className="text-sm font-medium">{`${test262.length} found`}</div>
          <button
            className="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md text-sm hover:bg-blue-600 hover:text-white [&>svg]:size-4"
            onClick={downloadAll}
          >
            {downloading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <FolderDownIcon />
            )}
            {downloading ? "Downloading.." : "Download All"}
          </button>
        </div>
      </div>
      <div
        ref={parentRef}
        className="relative min-h-0 w-full flex-auto basis-auto overflow-scroll"
      >
        <Test262ViewerContent
          test262={test262}
          // loading={test262Loading}
          // error={test262Error}
          rowVirtualizer={rowVirtualizer}
          sdoWaiting={false} // TODO wtf
        />
      </div>
    </>
  );
}

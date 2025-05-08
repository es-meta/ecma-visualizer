import {
  DownloadIcon,
  FlaskConicalIcon,
  FolderDownIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { useAtomValue } from "jotai";
import { selectionAtom, test262Atom } from "../atoms/app";
import { handleDownload, rawUrl } from "../util/download-file";
import { Card, CardHeader } from "../components/card";
import { SuspenseBoundary } from "../components/suspense-boundary";
import { ErrorConsumer, KnownError } from "../components/ErrorConsumer";
import { Loading } from "../components";

const url = (test262: string) =>
  `${import.meta.env.VITE_TEST262_URL}/${test262}`;

const fileName = (test262: string) => {
  const nameStr = test262.split("/");
  return nameStr[nameStr.length - 1];
};

const Test262ViewerContent = ({
  test262,
  rowVirtualizer,
}: {
  test262: string[];
  rowVirtualizer: Virtualizer<Element, Element>;
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
      logger.error(`failed to download ${fileName} ${filePath}`, e);
    }
  };

  return (
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
                className="inline-block rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => downloadFile(rawUrl(test), fileName(test))}
              >
                <DownloadIcon strokeWidth={2} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function Test262262ViewerLargerContent() {
  const test262Raw = useAtomValue(test262Atom);

  const test262 = test262Raw instanceof Error ? [] : test262Raw;

  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: test262 ? test262.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
  });

  if (test262Raw instanceof Error) {
    return <KnownError error={test262Raw} />;
  }

  return (
    <div
      ref={parentRef}
      className="relative min-h-0 w-full flex-auto basis-auto overflow-scroll"
    >
      <Test262ViewerContent test262={test262} rowVirtualizer={rowVirtualizer} />
    </div>
  );
}

function DownloadButton() {
  const test262 = useAtomValue(test262Atom);
  const [downloading, setDownloading] = useState(false);

  const downloadAll = useCallback(() => {
    if (test262 === null) return;
    if (test262 instanceof Error) return;

    setDownloading(true);
    if (downloading) {
      alert("Download is already in progress.");
      return;
    }

    fire(async () => {
      try {
        await handleDownload(test262);
      } catch (error) {
        logger.error("Download failed:", error);
      } finally {
        setDownloading(false);
      }
    });
  }, [test262, downloading]);

  if (test262 instanceof Error) {
    return null;
  }

  const disabled = downloading;

  return (
    <>
      <div className="text-sm font-medium">{`${test262.length} found`}</div>
      <button
        disabled={disabled}
        className="text-blue-500 dark:text-blue-400"
        onClick={downloadAll}
      >
        {downloading ? "Downloading.." : " Download All"}
        {downloading ? (
          <LoaderCircleIcon className="animate-spin" strokeWidth={2} />
        ) : (
          <FolderDownIcon strokeWidth={2} />
        )}
      </button>
    </>
  );
}

export function Test262Viewer() {
  const selection = useAtomValue(selectionAtom);

  return (
    <Card>
      <CardHeader title="Test262" icon={<FlaskConicalIcon />}>
        <SuspenseBoundary intentional>
          <DownloadButton />
        </SuspenseBoundary>
      </CardHeader>

      <SuspenseBoundary unexpected loading={<Loading />} error={ErrorConsumer}>
        {selection === null ? (
          <KnownError error={waitingSdoError()} />
        ) : (
          <Test262262ViewerLargerContent />
        )}
      </SuspenseBoundary>
    </Card>
  );
}

import { DownloadIcon } from "lucide-react";
import React from "react";
import { Virtualizer } from "@tanstack/react-virtual";

export const rawUrl = (test262: string) =>
  `https://raw.githubusercontent.com/tc39/test262/3a7a72aef5009eb22117231d40f9a5a66a9a595a/test/${test262}`;

const url = (test262: string) =>
  `https://github.com/tc39/test262/blob/3a7a72aef5009eb22117231d40f9a5a66a9a595a/test/${test262}`;

const fileName = (test262: string) => {
  const nameStr = test262.split("/");
  return nameStr[nameStr.length - 1];
};

const Test262Viewer = ({
  test262Set,
  rowVirtualizer,
}: {
  test262Set: string[];
  rowVirtualizer: Virtualizer<Element, Element>;
}) => {
  const parentRef = React.useRef(null);

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

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {rowVirtualizer.getVirtualItems().map((vi) => {
        const test262 = test262Set[vi.index];
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
              <a href={url(test262)} target="_blank">
                {test262}
              </a>
            </div>
            <div className="px-1 text-center">
              <button
                className="group inline cursor-pointer rounded-sm hover:bg-blue-600"
                onClick={() => downloadFile(rawUrl(test262), fileName(test262))}
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

export default Test262Viewer;

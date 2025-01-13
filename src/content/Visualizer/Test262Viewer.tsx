import { DownloadIcon } from "lucide-react";
import React, { useState } from "react";
import { Loading } from "@/content/App.tsx";
import { TD, TH, TR } from "@/content/Visualizer/CallStackViewer.tsx";

const rawUrl = (test262: string) =>
  `https://raw.githubusercontent.com/tc39/test262/3a7a72aef5009eb22117231d40f9a5a66a9a595a/test/${test262}`;

const url = (test262: string) =>
  `https://github.com/tc39/test262/blob/3a7a72aef5009eb22117231d40f9a5a66a9a595a/test/${test262}`;

const fileName = (test262: string) => {
  const nameStr = test262.split("/");
  return nameStr[nameStr.length - 1];
};

// const BATCH_SIZE = 5;

const Test262Viewer = ({ test262Set }: { test262Set: string[] }) => {
  // const [selectedIdx, setSelectedIdx] = useState<number>(0);
  // const [test262, setTest262] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  return (
    <table className="w-full border-collapse">
      {loading && <Loading />}
      <thead className="sticky left-0 top-0 z-[500] w-full bg-white">
        <tr>
          <TH>name</TH>
          <th className="text-center" />
        </tr>
      </thead>
      <tbody>
        {test262Set.map((test262) => (
          <TR>
            <TD>
              <a href={url(test262)} target="_blank">
                {test262}
              </a>
            </TD>
            <td className="px-1 text-center">
              <button
                className="inline cursor-pointer"
                onClick={() => downloadFile(rawUrl(test262), fileName(test262))}
              >
                <DownloadIcon className="h-4 w-4" />
              </button>
            </td>
          </TR>
        ))}
        {/*{algorithms &&*/}
        {/*  algorithms.map((algoNstep, idx) => {*/}
        {/*    const [algos, step] = algoNstep;*/}

        {/*    return (*/}
        {/*      <TR>*/}
        {/*        <TD className="px-2 text-sm">{idx}</TD>*/}
        {/*        <TD>*/}
        {/*          <Algorithm algorithm={algos} />*/}
        {/*        </TD>*/}
        {/*        <TD className="px-2">{step}</TD>*/}
        {/*        <td className="px-2 text-center">*/}
        {/*          {idx === 0 && (*/}
        {/*            <Trash2*/}
        {/*              size={15}*/}
        {/*              className="inline cursor-pointer text-neutral-300 hover:text-neutral-500"*/}
        {/*              onClick={popStack}*/}
        {/*            >*/}
        {/*              x*/}
        {/*            </Trash2>*/}
        {/*          )}*/}
        {/*        </td>*/}
        {/*      </TR>*/}
        {/*    );*/}
        {/*  })}*/}
      </tbody>
    </table>
  );
};

export default Test262Viewer;

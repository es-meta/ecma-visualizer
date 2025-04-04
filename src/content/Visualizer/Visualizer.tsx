import ProgramViewer from "./ProgramViewer.tsx";
import CallStackViewer from "./CallStackViewer.tsx";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/content/components/resizable.tsx";
import {
  Layers,
  Eraser,
  FlaskConical,
  LoaderCircle,
  FolderDown,
} from "lucide-react";

import useProgram from "./hooks/useProgram.ts";
import useSelection from "./hooks/useSelection.ts";
import useCallStack from "./hooks/useCallStack.ts";
import useTest262 from "./hooks/useTest262.ts";
import Test262Viewer from "./Test262Viewer.tsx";

import { Storage } from "./hooks/useStorage.ts";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useState, useRef } from "react";

import { handleDownload } from "../util/download-file.ts";

const Visualizer = ({ storage }: { storage: Storage }) => {
  const { callStack: callstack, convertedCallStack } = useCallStack();
  const { selection, sdoWaiting } = useSelection();
  const { codeAndStepCnt, setCodeAndStepCnt, loading, error } = useProgram(
    selection,
    callstack,
    storage.secIdToFuncId,
  );
  const {
    test262,
    loading: test262Loading,
    error: test262Error,
  } = useTest262(selection, callstack, loading, storage);

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
    <ResizablePanelGroup
      direction="vertical"
      className="flex min-h-0 w-full flex-auto flex-col items-stretch justify-start p-3"
    >
      <ResizablePanel className="relative flex min-h-0 w-full flex-col divide-y divide-neutral-300 overflow-hidden rounded-t-xl border border-neutral-300 bg-white">
        <ProgramViewer
          codeAndStepCnt={codeAndStepCnt}
          setCodeAndStepCnt={setCodeAndStepCnt}
          loading={loading}
          error={error}
          sdoWaiting={sdoWaiting}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Test262 */}
      <ResizablePanel className="relative flex w-full flex-col divide-y divide-neutral-300 overflow-hidden border border-neutral-300 bg-white">
        <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
          <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
            <FlaskConical />
            Test262
          </div>

          <div className="flex flex-row items-center gap-1">
            <div className="text-sm font-medium">{`${test262.length} found`}</div>
            <button
              className="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md text-sm hover:bg-blue-600 hover:text-white [&>svg]:size-4"
              onClick={downloadAll}
            >
              {downloading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <FolderDown />
              )}
              {downloading ? "Downloading.." : "Download All"}
            </button>
          </div>
        </div>
        <div
          ref={parentRef}
          className="relative min-h-0 w-full flex-auto basis-auto overflow-scroll"
        >
          <Test262Viewer
            test262={test262}
            loading={test262Loading || loading}
            error={test262Error}
            rowVirtualizer={rowVirtualizer}
          />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* CallPath */}
      <ResizablePanel className="relative flex min-h-0 w-full flex-1 flex-col divide-y divide-neutral-300 overflow-hidden rounded-b-xl border border-neutral-300 bg-white">
        <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
          <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
            <Layers />
            CallPath
          </div>
          {callstack.size() > 0 && (
            <button
              className="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md text-sm hover:bg-blue-600 hover:text-white [&>svg]:size-4"
              onClick={() => callstack.flush()}
            >
              <Eraser />
              Clear
            </button>
          )}
        </div>
        <section className="w-full flex-auto basis-auto overflow-scroll">
          <CallStackViewer
            callStack={callstack}
            convertedCallStack={convertedCallStack}
          />
        </section>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Visualizer;

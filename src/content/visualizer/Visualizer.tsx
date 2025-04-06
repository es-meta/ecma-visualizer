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
  Mouse,
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
      {!selection && !sdoWaiting && <StepSelectionWaiter />}
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
            sdoWaiting={sdoWaiting}
          />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* CallPath */}
      <ResizablePanel className="relative flex min-h-0 w-full flex-1 flex-col divide-y divide-neutral-300 overflow-hidden rounded-b-xl border border-neutral-300 bg-white">
        <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
          {selection && callstack.isEmpty() && <CallStackSelectionWaiter />}
          <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
            <Layers />
            CallPath
          </div>
          {!callstack.isEmpty() && (
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

const StepSelectionWaiter = () => {
  return (
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35 p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <Mouse />
        <p className="text-sm">
          Start by pressing a step with Option (Alt) + Left Click
        </p>
      </div>
    </div>
  );
};

const CallStackSelectionWaiter = () => {
  return (
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35 p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <Mouse />
        <p className="text-sm">
          Start by pressing a function link with Left Click
        </p>
      </div>
    </div>
  );
};

export default Visualizer;

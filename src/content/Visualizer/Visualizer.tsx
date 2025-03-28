import { Code, Mouse, OctagonX } from "lucide-react";
import ProgramViewer from "./ProgramViewer.tsx";
import CallStackViewer from "./CallStackViewer.tsx";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/content/components/resizable.tsx";
import { Layers, Eraser } from "lucide-react";
import { PlayButton } from "../components/PlayButton.tsx";

import useSelection from "./hooks/useSelection.ts";
import useCallStack from "./hooks/useCallStack.ts";

const WEB_DEBUGGER_URL = "http://localhost:3000";

const Visualizer = () => {
  const { callStack, convertedCallStack } = useCallStack();
  const { selection, sdoWaiting } = useSelection();

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="flex min-h-0 w-full flex-auto flex-col items-stretch justify-start p-3"
    >
      <ResizablePanel className="relative flex min-h-0 w-full flex-col divide-y divide-neutral-300 overflow-hidden rounded-t-xl border border-neutral-300 bg-white">
        <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
          <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
            <Code />
            Program
          </div>
          <PlayButton href="#" />
        </div>
        <div className="relative w-full flex-auto basis-auto overflow-scroll">
          <ProgramViewer
            selection={selection}
            callstack={callStack}
            sdoWaiting={sdoWaiting}
          />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Test262 */}
      {/* <ResizablePanel className="relative flex w-full flex-col divide-y divide-neutral-300 overflow-hidden border border-neutral-300 bg-white">
        <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
          <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
            <FlaskConical />
            Test262
          </div>
          {test262ViewerCondition && (
            <div className="flex flex-row items-center gap-1">
              <div className="text-sm font-medium">{`${selectedTest262Set.length} found`}</div>
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
          )}
        </div>
        <div
          ref={parentRef}
          className="relative min-h-0 w-full flex-auto basis-auto overflow-scroll"
        >
          {test262ViewerCondition && (
            <Test262Viewer
              test262Set={selectedTest262Set}
              rowVirtualizer={rowVirtualizer}
            />
          )}
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
          {callStack.size() > 0 && (
            <button
              className="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md text-sm hover:bg-blue-600 hover:text-white [&>svg]:size-4"
              onClick={() => callStack.flush()}
            >
              <Eraser />
              Clear
            </button>
          )}
        </div>
        <section className="w-full flex-auto basis-auto overflow-scroll">
          <CallStackViewer
            callStack={callStack}
            convertedCallStack={convertedCallStack}
          />
        </section>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export const Click = () => {
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

export const Click2 = () => {
  return (
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35 p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <Mouse />
        <p className="text-sm">Start by clicking a function</p>
      </div>
    </div>
  );
};

export const NotSupported = () => {
  return (
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35 p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <OctagonX />
        <p className="text-sm">Program not supported yet</p>
      </div>
    </div>
  );
};

export default Visualizer;

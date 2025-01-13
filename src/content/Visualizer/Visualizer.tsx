import {
  Code,
  Eraser,
  FlaskConical,
  FolderDown,
  Layers,
  Mouse,
  OctagonX,
} from "lucide-react";
import IndexedDb from "../util/indexed-db.ts";
import useVisualizer from "./useVisualizer.ts";
import { Loading } from "../App.tsx";
import CallStackViewer from "./CallStackViewer.tsx";
import ProgramViewer from "./ProgramViewer.tsx";
import Test262Viewer from "./Test262Viewer.tsx";
import useCallStack from "./useCallStack.tsx";
import useTest262 from "./useTest262.ts";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

const Visualizer = ({ db }: { db: IndexedDb }) => {
  const { callStack, popStack, flushStack } = useCallStack();
  const {
    state: progState,
    globalLoading: progLoading,

    convertCallIdToAlgoOrSyntax,
    selectedProgram,
    selectedIter,
  } = useVisualizer(db, callStack);

  const {
    state: test262State,
    globalLoading: test262Loading,
    selectedTest262Set,
  } = useTest262(db, callStack);

  const programViewerCondition =
    progState === "ProgramUpdated" &&
    selectedProgram !== null &&
    selectedIter !== null;
  const test262ViewerCondition =
    test262State === "ProgramUpdated" && selectedTest262Set !== null;

  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: selectedTest262Set ? selectedTest262Set.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
  });

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="flex min-h-0 w-full flex-auto flex-col items-stretch justify-start p-3"
    >
      {(progLoading || test262Loading) && <Loading />}

      {/* Minimal Program */}

      <ResizablePanel className="relative flex min-h-0 w-full flex-col divide-y divide-neutral-300 overflow-hidden rounded-t-xl border border-neutral-300 bg-white">
        <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
          <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
            <Code />
            Program
          </div>
        </div>
        <div className="relative w-full flex-auto basis-auto overflow-scroll">
          {programViewerCondition && (
            <ProgramViewer program={selectedProgram} iter={selectedIter} />
          )}
          {progState === "NotFound" && <NotSupported />}
          {progState === "Waiting" && <Click />}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Test262 */}
      <ResizablePanel className="relative flex w-full flex-col divide-y divide-neutral-300 overflow-hidden border border-neutral-300 bg-white">
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
                onClick={flushStack}
              >
                <FolderDown />
                Download All
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
          {test262State === "NotFound" && <NotSupported />}
          {test262State === "Waiting" && <Click />}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* CallPath */}
      <ResizablePanel className="relative flex min-h-0 w-full flex-1 flex-col divide-y divide-neutral-300 overflow-hidden rounded-b-xl border border-neutral-300 bg-white">
        {callStack.length === 0 && <Click2 />}
        <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
          <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
            <Layers />
            CallPath
          </div>
          <button
            className="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md text-sm hover:bg-blue-600 hover:text-white [&>svg]:size-4"
            onClick={flushStack}
          >
            <Eraser />
            Clear
          </button>
        </div>
        <section className="w-full flex-auto basis-auto overflow-scroll">
          {callStack.length !== 0 && (
            <CallStackViewer
              callStack={callStack}
              convertCallIdToAlgoOrSyntax={convertCallIdToAlgoOrSyntax}
              popStack={popStack}
            />
          )}
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

{
  /*<TabList className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2 text-neutral-600">*/
}
{
  /*  <div className="flex flex-row items-center gap-1">*/
}
{
  /*    <Tab*/
}
{
  /*      className="m-0 line-clamp-1 flex cursor-pointer flex-row items-center justify-start gap-1 rounded-md bg-white px-1 py-[2px] text-sm font-semibold text-neutral-500 outline-0 transition-all hover:bg-neutral-200 active:scale-90 data-[selected]:bg-es-500 data-[selected]:text-white [&>svg]:size-4">*/
}
{
  /*        <Code />*/
}
{
  /*        Program*/
}
{
  /*      </Tab>*/
}
{
  /*      <Tab className="m-0 line-clamp-1 flex cursor-pointer flex-row items-center justify-start gap-1 rounded-md bg-white px-1 py-[2px] text-sm font-semibold text-neutral-500 outline-0 transition-all hover:bg-neutral-200 active:scale-90 data-[selected]:bg-es-500 data-[selected]:text-white [&>svg]:size-4">*/
}
{
  /*        <FlaskConical />*/
}
{
  /*        Test262*/
}
{
  /*      </Tab>*/
}
{
  /*    </div>*/
}
{
  /*    {tab === 1 && test262ViewerCondition && (*/
}
{
  /*      <div className="m-0 p-0">*/
}
{
  /*        {`${selectedTest262Set?.length} founded`}*/
}
{
  /*      </div>*/
}
{
  /*    )}*/
}
{
  /*  </TabList>*/
}
{
  /*  <TabPanels className="relative flex min-h-0 flex-auto flex-col">*/
}
{
  /*    <TabPanel className="flex w-full flex-auto basis-auto overflow-scroll">*/
}
{
  /*      {programViewerCondition && (*/
}
{
  /*        <ProgramViewer program={selectedProgram} iter={selectedIter} />*/
}
{
  /*      )}*/
}
{
  /*      {state === "Waiting" && <Click />}*/
}
{
  /*      {state === "NotFound" && <NotSupported />}*/
}
{
  /*    </TabPanel>*/
}
{
  /*    <TabPanel className="flex size-full flex-1 overflow-scroll">*/
}
{
  /*      <section className="grow-1 shrink-1 max-h-[500px] basis-auto">*/
}
{
  /*        {test262ViewerCondition && (*/
}
{
  /*          <Test262Viewer test262Set={selectedTest262Set} />*/
}
{
  /*        )}*/
}
{
  /*        {state === "Waiting" && <Click />}*/
}
{
  /*        {state === "NotFound" && <NotSupported />}*/
}
{
  /*      </section>*/
}
{
  /*    </TabPanel>*/
}
{
  /*  </TabPanels>*/
}
{
  /*</TabGroup>*/
}

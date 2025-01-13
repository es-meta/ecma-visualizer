import { Code, FlaskConical, Layers, Mouse, OctagonX } from "lucide-react";
import IndexedDb from "../util/indexed-db.ts";
import ProgramViewer from "./ProgramViewer.tsx";
import useVisualizer from "./useVisualizer.ts";
import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Tab from "../components/Tab.tsx";
import Test262Viewer from "./Test262Viewer.tsx";
import { Loading } from "../App.tsx";
import CallStackViewer from "./CallStackViewer.tsx";

const Visualizer = ({ db }: { db: IndexedDb }) => {
  const {
    callStack,
    popStack,
    flushStack,

    state,
    globalLoading,
    tab,
    setTab,
    convertCallIdToAlgoOrSyntax,
    selectedProgram,
    selectedIter,
    selectedTest262Set,
  } = useVisualizer(db);

  const programViewerCondition =
    state === "ProgramUpdated" &&
    selectedProgram !== null &&
    selectedIter !== null;
  const test262ViewerCondition =
    state === "ProgramUpdated" && selectedTest262Set !== null;

  return (
    <div className="flex size-full h-full flex-auto flex-col justify-start gap-3 overflow-x-scroll p-3">
      {globalLoading && <Loading />}
      <TabGroup
        className="relative flex h-[300px] min-h-0 w-full flex-col divide-y divide-neutral-300 overflow-hidden rounded-xl border border-neutral-300 bg-white"
        selectedIndex={tab}
        onChange={setTab}
      >
        <TabList className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2 text-neutral-600">
          <div className="flex flex-row items-center gap-1">
            <Tab className="m-0 line-clamp-1 flex cursor-pointer flex-row items-center justify-start gap-1 rounded-md bg-white px-1 py-[2px] text-sm font-semibold text-neutral-500 outline-0 transition-all hover:bg-neutral-200 active:scale-90 data-[selected]:bg-es-500 data-[selected]:text-white [&>svg]:size-4">
              <Code />
              Program
            </Tab>
            <Tab className="m-0 line-clamp-1 flex cursor-pointer flex-row items-center justify-start gap-1 rounded-md bg-white px-1 py-[2px] text-sm font-semibold text-neutral-500 outline-0 transition-all hover:bg-neutral-200 active:scale-90 data-[selected]:bg-es-500 data-[selected]:text-white [&>svg]:size-4">
              <FlaskConical />
              Test262
            </Tab>
          </div>
          {tab === 1 && test262ViewerCondition && (
            <div className="m-0 p-0">
              {`${selectedTest262Set?.length} founded`}
            </div>
          )}
        </TabList>
        <TabPanels className="relative flex min-h-0 flex-auto flex-col">
          <TabPanel className="flex w-full flex-auto basis-auto overflow-scroll">
            {programViewerCondition && (
              <ProgramViewer program={selectedProgram} iter={selectedIter} />
            )}
            {state === "Waiting" && <Click />}
            {state === "NotFound" && <NotSupported />}
          </TabPanel>
          <TabPanel className="flex size-full flex-1 overflow-scroll">
            <section className="grow-1 shrink-1 max-h-[500px] basis-auto">
              {test262ViewerCondition && (
                <Test262Viewer test262Set={selectedTest262Set} />
              )}
              {state === "Waiting" && <Click />}
              {state === "NotFound" && <NotSupported />}
            </section>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      <section className="flex h-[350px] min-h-0 w-full flex-col divide-y divide-neutral-300 overflow-hidden rounded-xl border border-neutral-300 bg-white">
        <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
          <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
            <Layers />
            CallPath
          </div>
          <button className="cursor-pointer" onClick={flushStack}>
            delete all
          </button>
        </div>
        <section className="relative w-full flex-auto basis-auto overflow-scroll">
          {callStack.length === 0 && <Click2 />}
          {callStack.length !== 0 && (
            <CallStackViewer
              callStack={callStack}
              convertCallIdToAlgoOrSyntax={convertCallIdToAlgoOrSyntax}
              popStack={popStack}
            />
          )}
        </section>
      </section>
    </div>
  );
};

export const Click = () => {
  return (
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35">
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
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35">
      <div className="items-cener flex items-center justify-center gap-2">
        <Mouse />
        <p className="text-sm">Start by clicking a function</p>
      </div>
    </div>
  );
};

export const NotSupported = () => {
  return (
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35">
      <div className="items-cener flex items-center justify-center gap-2">
        <OctagonX />
        <p className="text-sm">Program not supported yet</p>
      </div>
    </div>
  );
};

export default Visualizer;

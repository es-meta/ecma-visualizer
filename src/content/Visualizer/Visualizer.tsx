import { ElementType, ReactNode, useState } from "react";
import { Code, FlaskConical, Layers, Play, Route } from "lucide-react";
import FeatureViewer from "./FeatureViewer.tsx";
import IndexedDb from "../util/indexed-db.ts";
import ProgramViewer from "./ProgramViewer.tsx";
import CallPathViewer from "./CallPathViewer.tsx";
import useVisualizer from "./useVisualizer.ts";
import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Tab from "../components/Tab.tsx";
import Test262Viewer from "./Test262Viewer.tsx";
import { Loading } from "../App.tsx";

const WEB_DEBUGGER_URL = "http://localhost:3000";

const Visualizer = ({ db }: { db: IndexedDb }) => {
  const {
    globalLoading,
    tab,
    setTab,
    changeFeature,
    changeCallPath,
    convertFuncIdToAlgoOrSyntax,
    currentFeatureList,
    callPaths,
    selectedFNCIdx,
    selectedProgram,
    selectedTest262Set,
    selectedIter,
    selectedCallPath,
    defaultProgram,
    defaultIter,
    defaultTest262Set,
  } = useVisualizer(db);

  const programViewerCondition =
    defaultProgram != null && selectedProgram != null;
  const featureViewerCondition =
    currentFeatureList !== null && selectedFNCIdx !== null;
  const callPathViewerCondition =
    callPaths !== null && selectedCallPath !== null;
  const test262ViewerCondition =
    defaultTest262Set !== null && selectedTest262Set !== null;

  const [defaultFlag, setDefaultFlag] = useState<boolean>(true);

  return (
    <div className="flex size-full min-h-0 flex-auto flex-col justify-start gap-4 overflow-x-scroll p-3">
      {globalLoading && <Loading />}
      <TabGroup
        className="flex flex-1 flex-col"
        selectedIndex={tab}
        onChange={setTab}
      >
        <TabList className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between px-3">
          <Tab className="data-[selected]:bg-blue-300">Program</Tab>
          <Tab className="data-[selected]:bg-blue-300">Test262</Tab>
        </TabList>
        <TabPanels className="flex flex-1">
          <TabPanel className="flex size-full flex-1">
            <Card enabled={programViewerCondition}>
              <CardHeader title="Program" icon={Code}>
                <a
                  href={`${WEB_DEBUGGER_URL}?prog=${encodeURIComponent(defaultFlag ? (defaultProgram ?? "") : (selectedProgram ?? ""))}&iter=${encodeURIComponent(defaultFlag ? (defaultIter ?? "") : (selectedIter ?? ""))}`}
                  target="_blank"
                  className="flex cursor-pointer flex-row items-center gap-1 text-sm text-blue-600 hover:scale-95"
                >
                  Run on Web Debugger
                  <Play size={12} />
                </a>
              </CardHeader>
              <section className="grow-1 shrink-1 basis-auto overflow-scroll">
                {programViewerCondition && (
                  <ProgramViewer
                    defaultProgram={defaultProgram}
                    program={selectedProgram}
                  />
                )}
              </section>
            </Card>
          </TabPanel>
          <TabPanel className="flex size-full flex-1">
            <Card enabled={test262ViewerCondition}>
              <CardHeader title="Test262" icon={FlaskConical}>
                {test262ViewerCondition && (
                  <p className="m-0 flex cursor-pointer flex-row items-center gap-1 text-sm text-blue-600 hover:scale-95">
                    {defaultFlag
                      ? defaultTest262Set?.length
                      : selectedTest262Set.length}{" "}
                    tests
                  </p>
                )}
              </CardHeader>
              <section className="grow-1 shrink-1 max-h-[500px] basis-auto overflow-scroll">
                {test262ViewerCondition && (
                  <Test262Viewer
                    defaultFlag={defaultFlag}
                    setDefaultFlag={setDefaultFlag}
                    defaultTest262Set={defaultTest262Set}
                    selectedTest262Set={selectedTest262Set}
                  />
                )}
              </section>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      <section className="flex flex-1 flex-row">
        <Card enabled={featureViewerCondition}>
          <CardHeader title="Language Feature" icon={Route}>
            {featureViewerCondition && (
              <p className="m-0 flex cursor-pointer flex-row items-center gap-1 text-sm text-blue-600 hover:scale-95">
                {currentFeatureList.length} features
              </p>
            )}
          </CardHeader>
          <section className="grow-1 shrink-1 basis-auto overflow-scroll">
            {featureViewerCondition && (
              <FeatureViewer
                currentFeatureList={currentFeatureList}
                selectedIdx={selectedFNCIdx}
                changeFeature={changeFeature}
              />
            )}
          </section>
        </Card>
        <Card enabled={callPathViewerCondition}>
          <CardHeader title="Call Path" icon={Layers}>
            {/* ToDo */}
            {callPathViewerCondition &&
              callPaths.filter((cp) => cp !== "ncp").length > 0 && (
                <p className="m-0 flex cursor-pointer flex-row items-center gap-1 text-sm text-blue-600 hover:scale-95">
                  {callPaths.length} callpath
                </p>
              )}
          </CardHeader>
          <section className="grow-1 shrink-1 basis-auto overflow-scroll">
            {callPathViewerCondition && (
              <CallPathViewer
                selectedCallPath={selectedCallPath}
                callPaths={callPaths}
                convertFuncIdToAlgoName={convertFuncIdToAlgoOrSyntax}
                changeCallPath={changeCallPath}
              />
            )}
          </section>
        </Card>
      </section>
    </div>
  );
};

const Card = ({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) => {
  return (
    <div className="relative flex min-h-0 min-w-[300px] flex-1 flex-col divide-y divide-neutral-300 overflow-hidden rounded-xl border border-neutral-300 bg-white">
      {children}
      {!enabled && (
        <div className="absolute left-0 top-0 flex size-full items-center justify-center bg-neutral-200 opacity-70">
          <p>Disabled</p>
        </div>
      )}
    </div>
  );
};

const CardHeader = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children?: ReactNode;
}) => {
  return (
    <header className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between px-3">
      <h3 className="font-500 m-0 line-clamp-1 flex flex-row items-center justify-start gap-1 pb-2 pt-2.5 text-sm text-neutral-600">
        <Icon size={16} />
        {title}
      </h3>
      {children}
    </header>
  );
};

export const EmptyVisualizer = () => {
  return (
    <div className="flex min-h-0 w-full flex-auto flex-row justify-start gap-4 overflow-x-scroll p-3">
      <Card enabled={false}>
        <CardHeader title="Program" icon={Code}></CardHeader>
        <section className="grow-1 shrink-1 basis-auto overflow-scroll"></section>
      </Card>
      <Card enabled={false}>
        <CardHeader title="Language Feature" icon={Route} />
        <section className="grow-1 shrink-1 basis-auto"></section>
      </Card>
      <Card enabled={false}>
        <CardHeader title="Call Path" icon={Layers} />
        <section className="grow-1 shrink-1 basis-auto"></section>
      </Card>
      <Card enabled={false}>
        <CardHeader title="Test262" icon={FlaskConical} />
        <div></div>
      </Card>
    </div>
  );
};

export default Visualizer;

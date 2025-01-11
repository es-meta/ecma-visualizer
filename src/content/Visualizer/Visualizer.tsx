import { ElementType, ReactNode, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Code,
  FlaskConical,
  Layers,
  Route,
} from "lucide-react";
import FeatureViewer from "./FeatureViewer.tsx";
import IndexedDb from "../util/indexed-db.ts";
import ProgramViewer from "./ProgramViewer.tsx";
import CallPathViewer from "./CallPathViewer.tsx";
import useVisualizer from "./useVisualizer.ts";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import Tab from "../components/Tab.tsx";
import Test262Viewer from "./Test262Viewer.tsx";
import { Loading } from "../App.tsx";
import clsx from "clsx";

const Visualizer = ({ db }: { db: IndexedDb }) => {
  const {
    // state,
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
    defaultProgram !== null &&
    selectedProgram !== null &&
    defaultIter !== null &&
    selectedIter !== null;
  const featureViewerCondition =
    currentFeatureList !== null && selectedFNCIdx !== null;
  const callPathViewerCondition =
    callPaths !== null && selectedCallPath !== null;
  const test262ViewerCondition =
    defaultTest262Set !== null && selectedTest262Set !== null;

  const [defaultFlag, setDefaultFlag] = useState<boolean>(true);
  const toggleDefault = () => setDefaultFlag(!defaultFlag);

  return (
    <div className="flex size-full min-h-0 flex-auto flex-col justify-start gap-3 overflow-x-scroll p-3">
      {globalLoading && <Loading />}
      <TabGroup
        className="relative flex min-h-[300px] w-full flex-1 flex-col divide-y divide-neutral-300 overflow-hidden rounded-xl border border-neutral-300 bg-white"
        selectedIndex={tab}
        onChange={setTab}
      >
        <TabList className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2 text-neutral-600">
          <div className="flex flex-row items-center gap-1">
            <Tab className="data-[selected]:bg-es-500 m-0 line-clamp-1 flex cursor-pointer flex-row items-center justify-start gap-1 rounded-md bg-white px-1 py-[2px] text-sm font-semibold text-neutral-500 outline-0 transition-all hover:bg-neutral-200 active:scale-90 data-[selected]:text-white [&>svg]:size-4">
              <Code />
              Program
            </Tab>
            <Tab className="data-[selected]:bg-es-500 m-0 line-clamp-1 flex cursor-pointer flex-row items-center justify-start gap-1 rounded-md bg-white px-1 py-[2px] text-sm font-semibold text-neutral-500 outline-0 transition-all hover:bg-neutral-200 active:scale-90 data-[selected]:text-white [&>svg]:size-4">
              <FlaskConical />
              Test262
            </Tab>
          </div>
          {tab === 1 && test262ViewerCondition && (
            <div className="m-0 p-0">
              {defaultFlag
                ? defaultTest262Set?.length
                : selectedTest262Set?.length}{" "}
              founded
            </div>
          )}
        </TabList>
        <TabPanels className="relative flex size-full flex-1 overflow-scroll">
          <TabPanel className="flex w-full flex-1">
            {/*<section className="grow-1 shrink-1 w-full basis-auto">*/}
            {programViewerCondition && (
              <ProgramViewer
                program={defaultFlag ? defaultProgram : selectedProgram}
                iter={defaultFlag ? defaultIter : selectedIter}
              />
            )}
            {/*</section>*/}
          </TabPanel>
          <TabPanel className="flex size-full flex-1">
            <section className="grow-1 shrink-1 max-h-[500px] basis-auto overflow-scroll">
              {test262ViewerCondition && (
                <Test262Viewer
                  test262Set={
                    defaultFlag ? defaultTest262Set : selectedTest262Set
                  }
                />
              )}
            </section>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      <Disclosure
        as="section"
        className="flex flex-1 flex-col"
        defaultOpen={!defaultFlag}
      >
        <DisclosureButton
          onClick={toggleDefault}
          className={clsx(
            "text-xm flex shrink-0 grow-0 basis-auto flex-row items-center justify-between rounded-xl p-3 font-semibold text-neutral-500 [&>svg]:size-4",
            {
              "bg-white": !defaultFlag,
              "text-black": !defaultFlag,
            },
          )}
        >
          <div className="flex flex-row items-center gap-1 [&>svg]:size-4">
            <Layers />
            CallPath
          </div>
          {defaultFlag ? <ChevronDown /> : <ChevronUp />}
        </DisclosureButton>
        <DisclosurePanel transition>
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
        </DisclosurePanel>
      </Disclosure>
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

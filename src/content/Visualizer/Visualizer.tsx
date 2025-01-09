import { ElementType, ReactNode } from "react";
import { Code, FlaskConical, Layers, Play, Route } from "lucide-react";
import FeatureViewer from "./FeatureViewer.tsx";
import IndexedDb from "../util/indexed-db.ts";
import ProgramViewer from "./ProgramViewer.tsx";
import CallPathViewer from "./CallPathViewer.tsx";
import Test262Viewer from "./Test262Viewer.tsx";
import useTest262 from "./useTest262.ts";

const WEB_DEBUGGER_URL = "http://localhost:3000";

const Visualizer = ({ db }: { db: IndexedDb }) => {
  // const {
  //   changeFeature,
  //   changeCallPath,
  //   convertFuncIdToAlgoOrSyntax,
  //   currentFeatureList,
  //   callPaths,
  //   selectedFNCIdx,
  //   selectedProgram,
  //   selectedIter,
  //   selectedCallPath,
  // } = useVisualizer(db);

  const {
    convertFuncIdToAlgoOrSyntax,
    changeFeature,
    changeCallPath,
    currentFeatureList,
    callPaths,
    selectedFNCIdx,
    selectedCallPath,
    selectedTest262,
  } = useTest262(db);

  const selectedProgram = null;
  const selectedIter = null;
  const programViewerCondition = selectedProgram != null;
  const featureViewerCondition =
    currentFeatureList !== null && selectedFNCIdx !== null;
  const callPathViewerCondition =
    callPaths !== null && selectedCallPath !== null;
  const test262ViewerCondition = selectedTest262 !== null;

  return (
    <div className="w-full flex flex-row justify-start p-3 gap-4 min-h-0 flex-auto overflow-x-scroll">
      <Card enabled={programViewerCondition}>
        <CardHeader title="Program" icon={Code}>
          <a
            href={`${WEB_DEBUGGER_URL}?prog=${encodeURIComponent(selectedProgram ?? "")}&iter=${encodeURIComponent(selectedIter ?? "")}`}
            target="_blank"
            className="cursor-pointer hover:scale-95 text-blue-600 text-sm flex flex-row gap-1 items-center"
          >
            Run on Web Debugger
            <Play size={12} />
          </a>
        </CardHeader>
        <section className="overflow-scroll grow-1 shrink-1 basis-auto">
          {programViewerCondition && (
            <ProgramViewer program={selectedProgram} />
          )}
        </section>
      </Card>
      <Card enabled={featureViewerCondition}>
        <CardHeader title="Language Feature" icon={Route}>
          {featureViewerCondition && (
            <p className="m-0 cursor-pointer hover:scale-95 text-blue-600 text-sm flex flex-row gap-1 items-center">
              {currentFeatureList.length} features
            </p>
          )}
        </CardHeader>
        <section className="overflow-scroll grow-1 shrink-1 basis-auto">
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
              <p className="m-0 cursor-pointer hover:scale-95 text-blue-600 text-sm flex flex-row gap-1 items-center">
                {callPaths.length} callpath
              </p>
            )}
        </CardHeader>
        <section className="overflow-scroll grow-1 shrink-1 basis-auto">
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
      <Card enabled={test262ViewerCondition}>
        <CardHeader title="Test262" icon={FlaskConical} />
        <section className="overflow-scroll grow-1 shrink-1 basis-auto">
          {test262ViewerCondition && (
            <Test262Viewer selectedTest262={selectedTest262} />
          )}
        </section>
      </Card>
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
    <div className="flex-1 relative min-w-[300px] min-h-0 overflow-hidden divide-neutral-300 divide-y bg-white rounded-xl border border-neutral-300 flex flex-col">
      {children}
      {!enabled && (
        <div className="absolute top-0 left-0 size-full bg-neutral-200 opacity-70 flex justify-center items-center">
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
    <header className="flex flex-row justify-between items-center px-3 grow-0 shrink-0 basis-auto">
      <h3 className="text-sm pt-2.5 pb-2 m-0 font-500 text-neutral-600 flex flex-row items-center justify-start gap-1 line-clamp-1">
        <Icon size={16} />
        {title}
      </h3>
      {children}
    </header>
  );
};

export const EmptyVisualizer = () => {
  return (
    <div className="w-full flex flex-row justify-start p-3 gap-4 min-h-0 flex-auto overflow-x-scroll">
      <Card enabled={false}>
        <CardHeader title="Program" icon={Code}></CardHeader>
        <section className="overflow-scroll grow-1 shrink-1 basis-auto"></section>
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

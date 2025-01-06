import { ElementType, ReactNode, useEffect, useState } from "react";
import { Code, Route, FlaskConical, Layers, Play } from "lucide-react";
import ProgramViewer from "./ProgramViewer.tsx";
import FeatureViewer from "./FeatureViewer.tsx";
import IndexedDb from "../util/indexed-db.ts";
import { FnCToProgId } from "../../types/maps.ts";
import CallPathViewer from "./CallPathViewer.tsx";

type SelectedStep = {
  alg: string | null;
  step: string | null;
};

const WEB_DEBUGGER_URL = "http://localhost:3000";

type State = "Waiting" | "StepUpdated" | "FeatureUpdated" | "CallPathUpdated";

const Visualizer = ({ db }: { db: IndexedDb }) => {
  const [selectedStep, setSelectedStep] = useState<SelectedStep>({
    alg: null,
    step: null,
  });

  const [fnc, setFnc] = useState<FnCToProgId | null>(null);

  const [features, setFeatures] = useState<string[]>([]);
  const [callPaths, setCallPaths] = useState<string[]>([]);

  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedCallPath, setSelectedCallPath] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedIter, setSelectedIter] = useState<number | null>(null);

  const [state, setState] = useState<State>("Waiting");

  // async function convertToESMetaAlg(ecId: string) {
  //   return await db.getValue("ecId-to-func", ecId);
  // }

  async function convertToECMAId(ESMetaAlg: string) {
    return await db.getValue("func-to-ecId", ESMetaAlg);
  }

  const handleFeatureChange = (f: string) => {
    if (state !== "Waiting") return;
    setSelectedFeature(f);
    setState("FeatureUpdated");
  };

  const handleCallPathChange = (cp: string) => {
    if (state !== "Waiting") return;
    setSelectedCallPath(cp);
    setState("CallPathUpdated");
  };

  useEffect(() => {
    const handleChange = (e: CustomEvent<SelectedStep>) => {
      if (state !== "Waiting") return;
      setSelectedStep(e.detail);
      setState("StepUpdated");
    };
    window.addEventListener("custom", handleChange as EventListener);
    return () => {
      window.removeEventListener("custom", handleChange as EventListener);
    };
  }, []);

  // set selected feature
  useEffect(() => {
    if (state !== "StepUpdated") return;
    const { alg, step } = selectedStep;

    if (!alg || !step) {
      setState("Waiting");
      return;
    }

    (async () => {
      const stepToNode = await db.getValue("step-to-node", alg);
      const node = stepToNode[step];

      if (!node) {
        console.error("No corresponding step : this should not happen");
        setState("Waiting");
        return;
      }

      const fnc = await db.getValue("node-to-progId", node);
      if (!fnc) {
        alert("Unsupported yet");
        setState("Waiting");
        return;
      }

      const ft = Object.keys(fnc);
      setFeatures(ft);
      setFnc(fnc);
      if (ft.length > 0) setSelectedFeature(ft[0]);
      setState("FeatureUpdated");
    })();
  }, [state]);

  // set selected call path
  useEffect(() => {
    if (state !== "FeatureUpdated") return;
    if (fnc === null || selectedFeature === null) {
      setState("Waiting");
      return;
    }

    if (!fnc[selectedFeature]) {
      console.error("Wrong selected feature : this should not happen");
      setState("Waiting");
      return;
    }

    const cp = Object.keys(fnc[selectedFeature]);
    setCallPaths(cp);

    if (cp.length > 0) setSelectedCallPath(cp[0]);
    setState("CallPathUpdated");
  }, [state]);

  // set selected program
  useEffect(() => {
    if (state !== "CallPathUpdated") return;
    if (fnc === null || selectedFeature === null || selectedCallPath === null) {
      setState("Waiting");
      return;
    }

    (async () => {
      const program = await db.getValue(
        "progId-to-prog",
        fnc[selectedFeature][selectedCallPath][0],
      );

      setSelectedProgram(program);
      setSelectedIter(fnc[selectedFeature][selectedCallPath][1]);
      setState("Waiting");
    })();
  }, [state]);

  return (
    <div className="w-full flex flex-row justify-start p-3 gap-4 min-h-0 flex-auto overflow-x-scroll">
      <Card disabled={!selectedProgram}>
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
          <ProgramViewer program={selectedProgram ?? undefined} />
        </section>
      </Card>
      <Card disabled={features.length === 0}>
        <CardHeader title="Language Feature" icon={Route} />
        <section className="overflow-scroll grow-1 shrink-1 basis-auto">
          <FeatureViewer
            selectedFeature={selectedFeature ?? undefined}
            features={features ?? undefined}
            handleFeatureChange={handleFeatureChange}
            convertToECMAId={convertToECMAId}
          />
        </section>
      </Card>
      <Card disabled={callPaths.length === 0}>
        <CardHeader title="Call Path" icon={Layers} />
        <section className="overflow-scroll grow-1 shrink-1 basis-auto">
          <CallPathViewer
            selectedCallPath={selectedCallPath ?? undefined}
            callPaths={callPaths}
            handleCallPathChange={handleCallPathChange}
            convertToECMAId={convertToECMAId}
          />
        </section>
      </Card>
      <Card disabled={!features}>
        <CardHeader title="Test262" icon={FlaskConical} />
        <div></div>
      </Card>
    </div>
  );
};

const Card = ({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled: boolean;
}) => {
  return (
    <div className="relative min-w-[300px] min-h-0 overflow-hidden divide-neutral-300 divide-y bg-white rounded-xl border border-neutral-300 flex flex-col">
      {children}
      {disabled && (
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

export default Visualizer;

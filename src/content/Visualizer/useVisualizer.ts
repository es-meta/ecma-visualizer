import { useEffect, useState } from "react";
import { CToProgId } from "../../types/maps.ts";
import IndexedDb from "../util/indexed-db.ts";

type SelectedStep = {
  ecId: string | null;
  step: string | null;
};

type State =
  | "Waiting"
  | "StepUpdated"
  | "FeatureUpdated"
  | "CallPathUpdated"
  | "ProgramUpdated";

function useVisualizer(db: IndexedDb) {
  const [selectedStep, setSelectedStep] = useState<SelectedStep>({
    ecId: null,
    step: null,
  });

  const [cToProgIds, setCToProgIds] = useState<CToProgId[] | null>(null);
  const [currentFeatureList, setCurrentFeatureList] = useState<string[] | null>(
    null,
  );
  const [callPaths, setCallPaths] = useState<string[] | null>(null);

  const [selectedFNCIdx, setSelectedFNCIdx] = useState<number | null>(null);
  const [selectedCallPath, setSelectedCallPath] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedIter, setSelectedIter] = useState<number | null>(null);

  const [state, setState] = useState<State>("Waiting");

  /** State Control **/

  useEffect(() => {
    const handleChange = (e: CustomEvent<SelectedStep>) => {
      if (!(state === "Waiting" || state === "ProgramUpdated")) return;
      const { ecId, step } = e.detail;
      setSelectedStep({ ecId, step });
      setState("StepUpdated");
    };

    window.addEventListener("custom", handleChange as EventListener);
    return () => {
      window.removeEventListener("custom", handleChange as EventListener);
    };
  }, []);

  async function handleStepUpdate(): Promise<boolean> {
    const { ecId, step } = selectedStep;
    if (!ecId || !step) return false;

    // 1. ecId to funcs
    const funcs = await db.getValue("ecId-to-func", ecId);
    if (funcs === null) return false;

    const funcIdsPromise = funcs.map((func) => convertFuncFuncId(func));
    const funcIds = (await Promise.all(funcIdsPromise)).filter(
      (fid) => fid !== null,
    );
    if (funcIds.length === 0) return false;

    // 2. funcs to stepToNodeIds
    const stepToNodeIdsPromise = funcIds.map((fid) =>
      db.getValue("step-to-nodeId", fid.toString()),
    );
    const stepToNodeIds = await Promise.all(stepToNodeIdsPromise);

    // 3. target nodeIds -> Same for both program and test262
    const nodeIds = stepToNodeIds
      .map((stn) => {
        if (!stn) return null;
        return safeGet(stn, step);
      })
      .filter((value) => value !== null);
    if (nodeIds.length === 0) return false;

    // 4. FnCs
    const fncsPromise = nodeIds.map((nodeId) =>
      db.getValue("nodeId-to-progId", nodeId.toString()),
    );

    const fncs = (await Promise.all(fncsPromise)).filter((fnc) => fnc !== null);
    if (fncs.length === 0) return false;

    const cps: CToProgId[] = [];
    const allFeatures = fncs.flatMap((fnc) => {
      const keys = Object.keys(fnc);
      keys.forEach((key) => {
        cps.push(fnc[key]);
      });
      return keys;
    });

    const featureHtmlPromises = allFeatures.map((feature) =>
      convertFuncIdToAlgoOrSyntax(feature),
    );
    const featureHtmls = (await Promise.all(featureHtmlPromises)).filter(
      (fnc) => fnc !== null,
    );

    setCurrentFeatureList(featureHtmls);
    setCToProgIds(cps);
    setSelectedFNCIdx(0);
    return true;
  }

  function handleFeatureUpdate(): boolean {
    if (cToProgIds === null || selectedFNCIdx === null) return false;
    const cpToProgId = cToProgIds[selectedFNCIdx];
    const cps = Object.keys(cpToProgId);
    if (cps.length === 0) return false;

    setCallPaths(cps);
    setSelectedCallPath(cps[0]);
    return true;
  }

  async function handleCallPathUpdate(): Promise<boolean> {
    if (
      cToProgIds === null ||
      selectedFNCIdx === null ||
      selectedCallPath === null
    )
      return false;

    const [progId, iter] = cToProgIds[selectedFNCIdx][selectedCallPath];
    const program = await db.getValue("progId-to-prog", progId.toString());

    setSelectedProgram(program);
    setSelectedIter(iter);

    return true;
  }

  useEffect(() => {
    switch (state) {
      case "Waiting":
        debug("--- Waiting ---");
        clearAll();
        break;
      case "StepUpdated":
        debug("--- StepUpdated ---");
        debug(`StepUpdated with ${selectedStep.ecId} ${selectedStep.step}`);
        (async () => {
          if (await handleStepUpdate()) setState("FeatureUpdated");
          else setState("Waiting");
        })();
        break;
      case "FeatureUpdated":
        debug("--- FeatureUpdated ---");
        debug(currentFeatureList);
        debug(cToProgIds);
        debug(selectedFNCIdx);
        if (handleFeatureUpdate()) setState("CallPathUpdated");
        else setState("Waiting");
        break;
      case "CallPathUpdated":
        debug("--- CallPathUpdated ---");
        debug(callPaths);
        debug(selectedFNCIdx);
        (async () => {
          if (await handleCallPathUpdate()) setState("ProgramUpdated");
          else setState("Waiting");
        })();
        break;
      case "ProgramUpdated":
        debug("--- ProgramUpdated ---");
        debug(selectedProgram);
        debug(selectedIter);
        break;
      default:
        break;
    }
  }, [state]);

  function clearAll() {
    setSelectedStep({ ecId: null, step: null });
    setCToProgIds(null);
    setCurrentFeatureList(null);
    setCallPaths(null);
    setSelectedFNCIdx(null);
    setSelectedCallPath(null);
    setSelectedProgram(null);
    setSelectedIter(null);
  }

  /** Visualizer Used Functions **/

  // async function convertEcIdFunc(ecId: string) {
  //   return await db.getValue("ecId-to-func", ecId);
  // }

  // async function convertFuncEcId(func: string) {
  //   return await db.getValue("func-to-ecId", func);
  // }

  async function convertFuncFuncId(func: string) {
    return await db.getValue("func-to-funcId", func);
  }

  async function convertFuncIdFunc(funcId: string) {
    return await db.getValue("funcId-to-func", funcId.toString());
  }

  async function convertFuncIdFeature(funcId: string) {
    return await db.getValue("funcId-to-featureHtml", funcId);
  }

  async function convertFuncIdToAlgoOrSyntax(funcId: string) {
    const isSdo = await convertFuncIdFeature(funcId);
    if (isSdo !== null) return isSdo;
    const func = await convertFuncIdFunc(funcId);
    if (func === null) return null;
    const ecId = await db.getValue("func-to-ecId", func);
    if (ecId === null) return null;
    return await db.getValue("ecId-to-algo-name", ecId);
  }

  const changeFeature = (idx: number) => {
    if (state !== "Waiting" && state !== "ProgramUpdated") return;
    setSelectedFNCIdx(idx);
    setState("FeatureUpdated");
  };

  const changeCallPath = (cp: string) => {
    if (state !== "Waiting" && state !== "ProgramUpdated") return;
    setSelectedCallPath(cp);
    setState("CallPathUpdated");
  };

  return {
    convertFuncIdToAlgoOrSyntax,
    changeFeature,
    changeCallPath,
    currentFeatureList,
    callPaths,
    selectedFNCIdx,
    selectedCallPath,
    selectedProgram,
    selectedIter,
  };
}

export default useVisualizer;

/** Helper Functions **/

const DEBUGGING = true;
function debug(obj: unknown): void {
  if (DEBUGGING) console.dir(obj);
}

function safeGet<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): T[K] | null {
  if (key in obj) {
    return obj[key];
  } else {
    console.error(`${String(key)} does not exist in the provided object.`);
    return null;
  }
}

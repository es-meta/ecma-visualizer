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
  | "FNCUpdated"
  | "ProgramUpdated"
  | "NotFound";

function useVisualizer(db: IndexedDb, callStack: number[]) {
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);
  const [selectedStep, setSelectedStep] = useState<SelectedStep>({
    ecId: null,
    step: null,
  });

  const [allCallPaths, setAllCallPaths] = useState<CToProgId | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedIter, setSelectedIter] = useState<number | null>(null);

  const [state, setState] = useState<State>("Waiting");

  /** State Control **/
  useEffect(() => {
    const handleChange = (e: CustomEvent<SelectedStep>) => {
      if (state === "FNCUpdated" || state === "StepUpdated") return;

      const { ecId, step } = e.detail;
      setSelectedStep({ ecId, step });
      setState("StepUpdated");
    };

    window.addEventListener("custom", handleChange as EventListener);
    return () => {
      window.removeEventListener("custom", handleChange as EventListener);
    };
  }, []);

  function callStackToString() {
    return callStack.length === 0 ? "" : callStack.join("<");
  }

  async function handleStepUpdate(): Promise<boolean> {
    const { ecId, step } = selectedStep;
    if (!ecId || !step) return false;
    debug(`ecId : ${ecId} / step : ${step} selected`);

    // 1. ecId to funcs
    const funcs = await ecIdToFunc(ecId);
    if (funcs === null) return false;

    const funcIdsPromise = funcs.map((func) => funcToFuncId(func));
    const funcIds = (await Promise.all(funcIdsPromise)).filter(
      (fid) => fid !== null,
    );
    if (funcIds.length === 0) return false;
    debug("[funcs from ecId]");
    debug(funcIds);

    // 2. funcs to stepToNodeIds
    const stepToNodeIdsPromise = funcIds.map((fid) =>
      stepToNodeId(fid.toString()),
    );
    const stepToNodeIds = await Promise.all(stepToNodeIdsPromise);
    debug("[step to nodeIds in funcs]");
    debug(stepToNodeIds);

    // 3. target nodeIds -> Same for both program and test262
    const nodeIds = stepToNodeIds
      .flatMap((stn) => {
        if (!stn) return null;
        return safeGet(stn, step);
      })
      .filter((value) => value !== null);
    if (nodeIds.length === 0) return false;
    debug("[target nodeIds]");
    debug(nodeIds);

    // 4. FnCs

    const fncsPromise = nodeIds.map((nodeId) =>
      nodeIdToProgId(nodeId?.toString()),
    );

    const fncs = (await Promise.all(fncsPromise)).filter((fnc) => fnc !== null);
    if (fncs.length === 0) return false;

    const allCtoProgIds: CToProgId = {};
    fncs.forEach((fnc) =>
      Object.keys(fnc).forEach((key) => {
        Object.keys(fnc[key]).forEach((innerKey) => {
          allCtoProgIds[innerKey] = fnc[key][innerKey];
        });
      }),
    );
    debug("[allCtoProgIds]");
    debug(allCtoProgIds);

    setAllCallPaths(allCtoProgIds);

    return true;
  }

  async function handleFnCUpdate(): Promise<boolean> {
    debug(`Current Call Stack : ${callStackToString()}`);
    if (allCallPaths === null) return false;
    const callPathString = callStackToString();

    let minProg = "";
    let minIter = -1;
    for (const callPathKey of Object.keys(allCallPaths)) {
      if (callPathKey.startsWith(callPathString)) {
        const [progId, iter] = allCallPaths[callPathKey];
        const minProgram = await progIdToProg(progId.toString());

        if (minProgram !== null) {
          if (minProg === "" || minProg.length > minProgram.length) {
            minProg = minProgram;
            minIter = iter;
          }
        }
      }
    }

    if (minIter === -1) return false;
    setSelectedProgram(minProg.trim());

    if (selectedStep.step?.includes("?")) minIter += 1;
    setSelectedIter(minIter);
    return true;
  }

  useEffect(() => {
    debug(`[State] : ${state}`);
    switch (state) {
      case "NotFound":
        if (globalLoading) setGlobalLoading(false);
        clearAll();
        break;
      case "Waiting":
        if (globalLoading) setGlobalLoading(false);
        clearAll();
        break;
      case "StepUpdated":
        if (!globalLoading) setGlobalLoading(true);
        debug(`StepUpdated with ${selectedStep.ecId} ${selectedStep.step}`);
        (async () => {
          if (await handleStepUpdate()) setState("FNCUpdated");
          else setState("NotFound");
        })();
        break;
      case "FNCUpdated":
        if (!globalLoading) setGlobalLoading(true);
        (async () => {
          if (await handleFnCUpdate()) setState("ProgramUpdated");
          else setState("NotFound");
        })();
        break;
      case "ProgramUpdated":
        if (globalLoading) setGlobalLoading(false);
        break;
      default:
        break;
    }
  }, [state]);

  useEffect(() => {
    if (!selectedStep.ecId || !selectedStep.step) setState("Waiting");
    else setState("StepUpdated");
  }, [callStack]);

  function clearAll() {
    setAllCallPaths(null);
    setSelectedProgram(null);
    setSelectedIter(null);
  }

  /** Map Converters **/
  async function stepToNodeId(step: string) {
    return await db.getValue("step-to-nodeId", step);
  }
  async function nodeIdToProgId(nodeId: string) {
    return await db.getValue("nodeId-to-progId", nodeId);
  }
  async function progIdToProg(progId: string) {
    return await db.getValue("progId-to-prog", progId);
  }
  async function funcIdToFunc(funcId: string) {
    return await db.getValue("funcId-to-func", funcId);
  }
  async function funcToEcId(func: string) {
    return await db.getValue("func-to-ecId", func);
  }
  async function ecIdToFunc(ecId: string) {
    return await db.getValue("ecId-to-func", ecId);
  }
  async function funcToFuncId(func: string) {
    return await db.getValue("func-to-funcId", func);
  }
  async function ecIdToAlgoName(ecId: string) {
    return await db.getValue("ecId-to-algo-name", ecId);
  }
  async function funcToSdo(funcId: string) {
    return await db.getValue("func-to-sdo", funcId);
  }
  async function callIdToFuncId(callId: string) {
    return await db.getValue("callId-to-funcId", callId);
  }

  async function convertCallIdToAlgoOrSyntax(
    callId: string,
  ): Promise<[string, string] | [null, null]> {
    const funcAndStep = await callIdToFuncId(callId);
    if (funcAndStep === null) return [null, null];
    const [funcId, step] = funcAndStep.split("/");
    const func = await funcIdToFunc(funcId);
    if (func === null) return [null, null];

    const regex = /\[\s*(\d+),\s*\d+\s*\]/;
    const match = func.match(regex);

    if (match) {
      const idx = match[1];
      const split = func.split("[");
      const sdo = await funcToSdo(`${split[0]}[${idx}]`);
      if (sdo === null) return [null, null];
      return [sdo, step];
    } else {
      const ecId = await funcToEcId(func);
      if (ecId === null) return [null, null];
      const alg = await ecIdToAlgoName(ecId);
      if (alg === null) return [null, null];
      return [alg, step];
    }
  }

  return {
    state,
    globalLoading,
    convertCallIdToAlgoOrSyntax,
    selectedProgram,
    selectedIter,
  };
}

export default useVisualizer;

/** Helper Functions **/

const DEBUGGING = true;
function debug(obj: unknown): void {
  if (!DEBUGGING) return;

  if (typeof obj === "string") console.log("\n", obj);
  else console.dir(obj);
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

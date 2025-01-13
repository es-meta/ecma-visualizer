import { useEffect, useState } from "react";
import { CToProgId, CToTestId } from "../../types/maps.ts";
import IndexedDb from "../util/indexed-db.ts";
import { decode } from "../util/decode.ts";
import useCallStack from "./useCallStack.tsx";

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

function useVisualizer(db: IndexedDb) {
  const [tab, setTab] = useState<number>(0);
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);

  const { callStack, popStack, flushStack } = useCallStack();

  const [selectedStep, setSelectedStep] = useState<SelectedStep>({
    ecId: null,
    step: null,
  });

  const [allCallPaths, setAllCallPaths] = useState<CToProgId | null>(null);
  const [allTestIds, setAllTestIds] = useState<CToTestId | null>(null);

  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedTest262Set, setSelectedTest262] = useState<string[] | null>(
    null,
  );
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

  function callStackToString() {
    return callStack.length === 0 ? "ncp" : callStack.join("<");
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
    // ToDO Eliminate Redundant Codes
    if (tab === 0) {
      const fncsPromise = nodeIds.map((nodeId) =>
        nodeIdToProgId(nodeId?.toString()),
      );

      const fncs = (await Promise.all(fncsPromise)).filter(
        (fnc) => fnc !== null,
      );
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
    } else {
      const fncsPromise = nodeIds.map((nodeId) =>
        nodeIdToTest262(nodeId?.toString()),
      );

      const fncs = (await Promise.all(fncsPromise)).filter(
        (fnc) => fnc !== null,
      );
      if (fncs.length === 0) return false;

      const allCToTestIds: CToTestId = {};
      fncs.forEach((fnc) =>
        Object.keys(fnc).forEach((key) => {
          Object.keys(fnc[key]).forEach((innerKey) => {
            allCToTestIds[innerKey] = fnc[key][innerKey];
          });
        }),
      );
      debug("[allCToTestIds]");
      debug(allCToTestIds);

      setAllTestIds(allCToTestIds);
    }
    return true;
  }

  async function handleFnCUpdate(): Promise<boolean> {
    if (tab === 0) {
      if (allCallPaths === null) return false;
      const callPathString = callStackToString();

      let minProg = "";
      let minIter = -1;
      for (const callPathKey of Object.keys(allCallPaths)) {
        console.log(
          callPathKey,
          callPathString,
          callPathKey.startsWith(callPathString),
        );

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
      setSelectedProgram(minProg);
      setSelectedIter(minIter);
    } else {
      if (allTestIds === null) return false;
      const callPathString = callStackToString();
      const encodedString = allTestIds[callPathString];
      if (!encodedString) return false;
      const test262Ids = decode(encodedString);
      const test262NamesPromise = test262Ids.map((test262Id) =>
        testIdToTest262(test262Id),
      );
      const test262Names = (await Promise.all(test262NamesPromise)).filter(
        (test262Name) => test262Name !== null,
      );
      if (test262Names.length === 0) return false;
      setSelectedTest262(test262Names);
    }
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
        if (!selectedStep.ecId || !selectedStep.step) {
          setState("Waiting");
          break;
        }
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
  }, [tab, callStack]);

  function clearAll() {
    setAllCallPaths(null);
    setAllTestIds(null);
    setSelectedProgram(null);
    setSelectedIter(null);
    setSelectedTest262(null);
  }

  /** Map Converters **/
  async function stepToNodeId(step: string) {
    return await db.getValue("step-to-nodeId", step);
  }
  async function nodeIdToProgId(nodeId: string) {
    return await db.getValue("nodeId-to-progId", nodeId);
  }
  async function nodeIdToTest262(nodeId: string) {
    return await db.getValue("nodeId-to-test262", nodeId);
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
  async function testIdToTest262(testId: string) {
    return await db.getValue("testId-to-test262", testId);
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

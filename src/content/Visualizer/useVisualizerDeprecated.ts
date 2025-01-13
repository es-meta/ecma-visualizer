// import { useEffect, useState } from "react";
// import { CToProgId, CToTestId } from "../../types/maps.ts";
// import IndexedDb from "../util/indexed-db.ts";
// import { decode } from "../util/decode.ts";
//
// type SelectedStep = {
//   ecId: string | null;
//   step: string | null;
// };
//
// type State =
//   | "Waiting"
//   | "StepUpdated"
//   | "FeatureUpdated"
//   | "CallPathUpdated"
//   | "ProgramUpdated"
//   | "NotFound";
//
// function useVisualizer(db: IndexedDb) {
//   const [tab, setTab] = useState<number>(0);
//   const [globalLoading, setGlobalLoading] = useState<boolean>(false);
//   const [callStack, setCallStack] = useState<number[]>([]);
//
//   const [selectedStep, setSelectedStep] = useState<SelectedStep>({
//     ecId: null,
//     step: null,
//   });
//
//   const [cToProgIds, setCToProgIds] = useState<CToProgId[] | null>(null);
//   const [cToTestIds, setCtoTestIds] = useState<CToTestId[] | null>(null);
//   const [currentFeatureList, setCurrentFeatureList] = useState<string[] | null>(
//     null,
//   );
//   const [callPaths, setCallPaths] = useState<string[] | null>(null);
//
//   const [selectedFNCIdx, setSelectedFNCIdx] = useState<number | null>(null);
//   const [selectedCallPath, setSelectedCallPath] = useState<string | null>(null);
//   const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
//   const [selectedTest262Set, setSelectedTest262] = useState<string[] | null>(
//     null,
//   );
//   const [selectedIter, setSelectedIter] = useState<number | null>(null);
//
//   const [state, setState] = useState<State>("Waiting");
//   const [defaultProgram, setDefaultProgram] = useState<string | null>(null);
//   const [defaultIter, setDefaultIter] = useState<number | null>(null);
//   const [defaultTest262Set, setDefaultTest262Set] = useState<string[] | null>(
//     null,
//   );
//
//   /** State Control **/
//   useEffect(() => {
//     const existingData = sessionStorage.getItem("callstack");
//     const dataArray = existingData ? JSON.parse(existingData) : [];
//     setCallStack(dataArray);
//
//     const handleChange = (e: CustomEvent<SelectedStep>) => {
//       if (!(state === "Waiting" || state === "ProgramUpdated")) return;
//       const { ecId, step } = e.detail;
//       setSelectedStep({ ecId, step });
//       setState("StepUpdated");
//     };
//
//     window.addEventListener("custom", handleChange as EventListener);
//     return () => {
//       window.removeEventListener("custom", handleChange as EventListener);
//     };
//   }, []);
//
//   async function handleStepUpdate(): Promise<boolean> {
//     const { ecId, step } = selectedStep;
//     if (!ecId || !step) return false;
//     debug(`ecId : ${ecId} / step : ${step} selected`);
//
//     // 1. ecId to funcs
//     const funcs = await ecIdToFunc(ecId);
//     if (funcs === null) return false;
//
//     const funcIdsPromise = funcs.map((func) => funcToFuncId(func));
//     const funcIds = (await Promise.all(funcIdsPromise)).filter(
//       (fid) => fid !== null,
//     );
//     if (funcIds.length === 0) return false;
//     debug("[funcs from ecId]");
//     debug(funcIds);
//
//     // 2. funcs to stepToNodeIds
//     const stepToNodeIdsPromise = funcIds.map((fid) =>
//       stepToNodeId(fid.toString()),
//     );
//     const stepToNodeIds = await Promise.all(stepToNodeIdsPromise);
//     debug("[step to nodeIds in funcs]");
//     debug(stepToNodeIds);
//
//     // 3. target nodeIds -> Same for both program and test262
//     const nodeIds = stepToNodeIds
//       .flatMap((stn) => {
//         if (!stn) return null;
//         return safeGet(stn, step);
//       })
//       .filter((value) => value !== null);
//     if (nodeIds.length === 0) return false;
//     debug("[target nodeIds]");
//     debug(nodeIds);
//
//     // 4. FnCs
//     // ToDO Eliminate Redundant Codes
//     if (tab === 0) {
//       const fncsPromise = nodeIds.map((nodeId) =>
//         nodeIdToProgId(nodeId?.toString()),
//       );
//
//       const fncs = (await Promise.all(fncsPromise)).filter(
//         (fnc) => fnc !== null,
//       );
//       if (fncs.length === 0) return false;
//       debug("[fncs from targetNodeIDs]");
//       debug(fncs);
//
//       const cps: CToProgId[] = [];
//       const allFeatures = fncs.flatMap((fnc) => {
//         const keys = Object.keys(fnc);
//         keys.forEach((key) => {
//           cps.push(fnc[key]);
//         });
//         return keys;
//       });
//       debug("[cps collected]");
//       debug(cps);
//
//       const allProgIdNIter = cps.flatMap((cp) =>
//         Object.keys(cp).map((key) => cp[key]),
//       );
//       const allProgPromise = allProgIdNIter.map((id) =>
//         progIdToProg(id[0].toString()),
//       );
//       const allProgs = (await Promise.all(allProgPromise)).filter(
//         (prog) => prog !== null,
//       );
//       if (allProgs.length === 0) return false;
//       let minimalProg: string = allProgs[0];
//       let minimalIter: number = allProgIdNIter[0][1];
//       allProgs.forEach((prog, idx) => {
//         if (minimalProg.length > prog.length) {
//           minimalProg = prog;
//           minimalIter = allProgIdNIter[idx][1];
//         }
//       });
//       setDefaultProgram(minimalProg);
//       setDefaultIter(minimalIter);
//
//       const featureHtmlPromises = allFeatures.map((feature) =>
//         convertFuncIdToAlgoOrSyntax(feature),
//       );
//       const featureHtmls = (await Promise.all(featureHtmlPromises)).filter(
//         (fnc) => fnc !== null,
//       );
//
//       setCurrentFeatureList(featureHtmls);
//       setCToProgIds(cps);
//       setSelectedFNCIdx(0);
//     } else {
//       const fncsPromise = nodeIds.map((nodeId) =>
//         nodeIdToTest262(nodeId.toString()),
//       );
//
//       const fncs = (await Promise.all(fncsPromise)).filter(
//         (fnc) => fnc !== null,
//       );
//       if (fncs.length === 0) return false;
//       debug("[fncs from targetNodeIDs for Test]");
//       debug(fncs);
//
//       const cps: CToTestId[] = [];
//       const allFeatures = fncs.flatMap((fnc) => {
//         const keys = Object.keys(fnc);
//         keys.forEach((key) => {
//           cps.push(fnc[key]);
//         });
//         return keys;
//       });
//
//       const allTestEncodings = cps.flatMap((cp) =>
//         Object.keys(cp).flatMap((key) => cp[key]),
//       );
//       const allTestIdSets: Set<string> = new Set();
//       allTestEncodings.forEach((encoding) => {
//         decode(encoding).forEach((id) => allTestIdSets.add(id));
//       });
//       const allTestPromise = Array.from(allTestIdSets).map((testId) =>
//         testIdToTest262(testId),
//       );
//       const allTestName = (await Promise.all(allTestPromise)).filter(
//         (prog) => prog !== null,
//       );
//       setDefaultTest262Set(allTestName);
//
//       const featureHtmlPromises = allFeatures.map((feature) =>
//         convertFuncIdToAlgoOrSyntax(feature),
//       );
//       const featureHtmls = (await Promise.all(featureHtmlPromises)).filter(
//         (fnc) => fnc !== null,
//       );
//       debug("[featureHtmls]");
//       debug(featureHtmls);
//
//       setCurrentFeatureList(featureHtmls);
//       setCtoTestIds(cps);
//       setSelectedFNCIdx(0);
//     }
//     return true;
//   }
//
//   function handleFeatureUpdate(): boolean {
//     if (tab === 0) {
//       if (cToProgIds === null || selectedFNCIdx === null) return false;
//       const cpToProgId = cToProgIds[selectedFNCIdx];
//       const cps = Object.keys(cpToProgId);
//       if (cps.length === 0) return false;
//       debug("[cToProgIds]");
//       debug(cpToProgId);
//
//       setCallPaths(cps);
//       setSelectedCallPath(cps[0]);
//     } else {
//       if (cToTestIds === null || selectedFNCIdx === null) return false;
//       const cpToTestId = cToTestIds[selectedFNCIdx];
//       const cps = Object.keys(cpToTestId);
//       debug("cps");
//       debug(cps);
//
//       if (cps.length === 0) return false;
//
//       setCallPaths(cps);
//       setSelectedCallPath(cps[0]);
//     }
//     return true;
//   }
//
//   async function handleCallPathUpdate(): Promise<boolean> {
//     if (tab === 0) {
//       if (
//         cToProgIds === null ||
//         selectedFNCIdx === null ||
//         selectedCallPath === null
//       )
//         return false;
//
//       const [progId, iter] = cToProgIds[selectedFNCIdx][selectedCallPath];
//       const program = await progIdToProg(progId.toString());
//       debug("program");
//       debug(program);
//
//       setSelectedProgram(program);
//       setSelectedIter(iter);
//     } else {
//       if (
//         cToTestIds === null ||
//         selectedFNCIdx === null ||
//         selectedCallPath === null
//       )
//         return false;
//
//       const encodedString = cToTestIds[selectedFNCIdx][selectedCallPath];
//       debug(`encoded!! ${encodedString}`);
//       const test262Ids = decode(encodedString);
//       debug(`decoded`);
//       debug(test262Ids);
//       const test262NamePromise = test262Ids.map((test262Id) =>
//         testIdToTest262(test262Id),
//       );
//       const test262Names = (await Promise.all(test262NamePromise)).filter(
//         (test262Name) => test262Name !== null,
//       );
//       if (test262Names.length === 0) return false;
//
//       setSelectedTest262(test262Names);
//     }
//
//     return true;
//   }
//
//   useEffect(() => {
//     switch (state) {
//       case "NotFound":
//         if (globalLoading) setGlobalLoading(false);
//         clearAll();
//         break;
//       case "Waiting":
//         if (globalLoading) setGlobalLoading(false);
//         debug(
//           "----------------------------------- Waiting -----------------------------------",
//         );
//         clearAll();
//         break;
//       case "StepUpdated":
//         if (!globalLoading) setGlobalLoading(true);
//         debug(
//           "----------------------------------- StepUpdated -----------------------------------",
//         );
//         debug(`StepUpdated with ${selectedStep.ecId} ${selectedStep.step}`);
//         if (!selectedStep.ecId || !selectedStep.step) {
//           setState("Waiting");
//           return;
//         }
//         (async () => {
//           if (await handleStepUpdate()) setState("FeatureUpdated");
//           else setState("NotFound");
//         })();
//         break;
//       case "FeatureUpdated":
//         if (!globalLoading) setGlobalLoading(true);
//         debug(
//           "----------------------------------- FeatureUpdated -----------------------------------",
//         );
//         if (handleFeatureUpdate()) setState("CallPathUpdated");
//         else setState("NotFound");
//         break;
//       case "CallPathUpdated":
//         if (!globalLoading) setGlobalLoading(true);
//         debug(
//           "----------------------------------- CallPathUpdated -----------------------------------",
//         );
//         (async () => {
//           if (await handleCallPathUpdate()) setState("ProgramUpdated");
//           else setState("NotFound");
//         })();
//         break;
//       case "ProgramUpdated":
//         if (globalLoading) setGlobalLoading(false);
//         debug(
//           "----------------------------------- ProgramUpdated -----------------------------------",
//         );
//         break;
//       default:
//         break;
//     }
//   }, [state]);
//
//   useEffect(() => {
//     setState("StepUpdated");
//   }, [tab]);
//
//   function clearAll() {
//     setCToProgIds(null);
//     setCurrentFeatureList(null);
//     setCallPaths(null);
//     setSelectedFNCIdx(null);
//     setSelectedCallPath(null);
//     setSelectedProgram(null);
//     setSelectedIter(null);
//     setCtoTestIds(null);
//     setSelectedTest262(null);
//     setDefaultProgram(null);
//     // setDefaultTest262Set(null)
//   }
//
//   /** Map Converters **/
//   async function stepToNodeId(step: string) {
//     return await db.getValue("step-to-nodeId", step);
//   }
//   async function nodeIdToProgId(nodeId: string) {
//     return await db.getValue("nodeId-to-progId", nodeId);
//   }
//   async function nodeIdToTest262(nodeId: string) {
//     return await db.getValue("nodeId-to-test262", nodeId);
//   }
//   async function progIdToProg(progId: string) {
//     return await db.getValue("progId-to-prog", progId);
//   }
//   async function funcIdToFunc(funcId: string) {
//     return await db.getValue("funcId-to-func", funcId);
//   }
//   async function funcToEcId(func: string) {
//     return await db.getValue("func-to-ecId", func);
//   }
//   async function ecIdToFunc(ecId: string) {
//     return await db.getValue("ecId-to-func", ecId);
//   }
//   async function funcToFuncId(func: string) {
//     return await db.getValue("func-to-funcId", func);
//   }
//   async function ecIdToAlgoName(ecId: string) {
//     return await db.getValue("ecId-to-algo-name", ecId);
//   }
//   async function funcToSdo(funcId: string) {
//     return await db.getValue("func-to-sdo", funcId);
//   }
//   async function testIdToTest262(testId: string) {
//     return await db.getValue("testId-to-test262", testId);
//   }
//
//   async function convertFuncIdToAlgoOrSyntax(funcId: string) {
//     const func = await funcIdToFunc(funcId);
//     if (func === null) return null;
//
//     const regex = /\[\s*(\d+),\s*\d+\s*\]/;
//     const match = func.match(regex);
//
//     if (match) {
//       const idx = match[1];
//       const split = func.split("[");
//       return await funcToSdo(`${split[0]}[${idx}]`);
//     } else {
//       const ecId = await funcToEcId(func);
//       if (ecId === null) return null;
//       return await ecIdToAlgoName(ecId);
//     }
//   }
//
//   /* Visualizer used functions */
//   const changeFeature = (idx: number) => {
//     if (state !== "Waiting" && state !== "ProgramUpdated") return;
//     setSelectedFNCIdx(idx);
//     setState("FeatureUpdated");
//   };
//
//   const changeCallPath = (cp: string) => {
//     if (state !== "Waiting" && state !== "ProgramUpdated") return;
//     setSelectedCallPath(cp);
//     setState("CallPathUpdated");
//   };
//
//   return {
//     callStack,
//     state,
//     globalLoading,
//     tab,
//     setTab,
//     convertFuncIdToAlgoOrSyntax,
//     changeFeature,
//     changeCallPath,
//     currentFeatureList,
//     callPaths,
//     selectedFNCIdx,
//     selectedCallPath,
//     selectedProgram,
//     selectedIter,
//     selectedTest262Set,
//     defaultProgram,
//     defaultIter,
//     defaultTest262Set,
//   };
// }
//
// export default useVisualizer;
//
// /** Helper Functions **/
//
// const DEBUGGING = true;
// function debug(obj: unknown): void {
//   if (!DEBUGGING) return;
//
//   if (typeof obj === "string") console.log("\n", obj);
//   else console.dir(obj);
// }
//
// function safeGet<T extends object, K extends keyof T>(
//   obj: T,
//   key: K,
// ): T[K] | null {
//   if (key in obj) {
//     return obj[key];
//   } else {
//     console.error(`${String(key)} does not exist in the provided object.`);
//     return null;
//   }
// }

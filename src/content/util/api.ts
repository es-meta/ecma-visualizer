type SecIdToFuncId = Record<string, string>;
type SecIdToFuncName = Record<string, string>;
type StepToNodeId = Record<string, number[]>;
type FeatureToProgId = Record<string, Record<string, [number, number]>>;
type FeatureToEncodedTest262 = Record<string, Record<string, string>>;
import { bitwiseOrStrings, convertToIndex } from "../util/decode.ts";

const BASE_URL =
  "https://raw.githubusercontent.com/Goonco/tmpvis/refs/heads/main";

class FetchError extends Error {
  constructor(public response: Response) {
    super("Fetch failed");
    this.name = "FetchError";
  }
}

async function _fetch<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw response;
  return await response.json();
}

async function fetchFuncIdfromSecId(secId: string): Promise<string> {
  const nameMap = await chrome.storage.local.get();
  return nameMap["secIdToFuncId"][secId];
}

async function fetchFuncNameFromSecId(secId: string): Promise<string> {
  const secIdToFuncName = await _fetch<SecIdToFuncName>(
    `${BASE_URL}/secIdToFuncName.json`,
  );
  return secIdToFuncName[secId];
}

async function fetchStepToNodeId(
  secId: string,
  step: string,
): Promise<number[]> {
  const funcId = await fetchFuncIdfromSecId(secId);
  const stepToNodeId = await _fetch<StepToNodeId>(
    `${BASE_URL}/stepToNodeId/${funcId}.json`,
  );

  return stepToNodeId[step];
}

async function fetchAllTest262ByNodeId(nodeId: number): Promise<string[]> {
  const featureToEncoded = await fetchTest262FNCByNodeId(nodeId);

  const encodings = Object.keys(featureToEncoded).flatMap((feature) => {
    const cpToProgId = featureToEncoded[feature];
    return Object.keys(cpToProgId).map((cp) => cpToProgId[cp]);
  });

  let accBitString = "";
  const testIds = encodings
    .filter((e) => e !== "")
    .map(
      (encodeStrings) =>
        (accBitString = bitwiseOrStrings(accBitString, encodeStrings)),
    );

  return await Promise.all(
    convertToIndex(accBitString).map((testId) =>
      fetchTest262NameByTest262Id(testId),
    ),
  );
}

async function fetchMinimalScriptByNodeId(nodeId: number) {
  const featureToProgId = await fetchFNCByNodeId(nodeId);
  const [progId, stepCnt] = featureToProgId["minimal"]["minimal"];

  return await fetchScriptByProgId(progId, stepCnt);
}

async function fetchFNCByNodeId(nodeId: number) {
  return await _fetch<FeatureToProgId>(
    `${BASE_URL}/nodeIdToProgId/${nodeId}.json`,
  );
}

async function fetchTest262FNCByNodeId(nodeId: number) {
  return await _fetch<FeatureToEncodedTest262>(
    `${BASE_URL}/nodeIdToTest262/${nodeId}.json`,
  );
}

async function fetchScriptByProgId(
  progId: number,
  stepCount: number,
): Promise<[string, number]> {
  return [
    await _fetch<string>(`${BASE_URL}/progIdToScript/${progId}.json`),
    stepCount,
  ];
}

async function fetchTest262NameByTest262Id(testId: string) {
  const nameMap = await chrome.storage.local.get();
  return nameMap["test262IdToTest262"][testId];
}

export {
  fetchMinimalScriptByNodeId,
  fetchFuncIdfromSecId,
  fetchFuncNameFromSecId,
  fetchFNCByNodeId,
  fetchScriptByProgId,
  fetchStepToNodeId,
  fetchAllTest262ByNodeId,
};

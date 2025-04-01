type SecIdToFuncId = Record<string, string>;
type SecIdToFuncName = Record<string, string>;
type StepToNodeId = Record<string, number[]>;
type FeatureToProgId = Record<string, Record<string, [number, number]>>;

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

async function fetchNodeIdToScript(
  nodeId: number,
): Promise<[string, number][]> {
  const featureToProgId = await fetchFNCByNodeId(nodeId);

  // Array of [progId, iterCnt]
  const progIds = Object.keys(featureToProgId).flatMap((feature) => {
    const cpToProgId = featureToProgId[feature];
    return Object.keys(cpToProgId).map((cp) => cpToProgId[cp]);
  });

  return await Promise.all(
    progIds.map((pair) => fetchScriptByProgId(pair[0], pair[1])),
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

async function fetchScriptByProgId(
  progId: number,
  stepCount: number,
): Promise<[string, number]> {
  return [
    await _fetch<string>(`${BASE_URL}/progIdToScript/${progId}.json`),
    stepCount,
  ];
}

export {
  fetchMinimalScriptByNodeId,
  fetchFuncIdfromSecId,
  fetchFuncNameFromSecId,
  fetchFNCByNodeId,
  fetchScriptByProgId,
  fetchStepToNodeId,
  fetchNodeIdToScript,
};

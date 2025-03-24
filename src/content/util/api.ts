type SecIdToFuncId = Record<string, string>;
type SecIdToFuncName = Record<string, string>;
type StepToNodeId = Record<string, number[]>;
type FeatureToProgId = Record<string, Record<string, number[]>>;

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
  if (!response.ok) throw new FetchError(response);
  return await response.json();
}

async function fetchFuncIdfromSecId(secId: string): Promise<string> {
  const secIdToFuncId = await _fetch<SecIdToFuncId>(
    `${BASE_URL}/secIdToFuncId.json`,
  );
  return secIdToFuncId[secId];
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

async function fetchNodeIdToScript(nodeId: number): Promise<string[]> {
  const featureToProgId = await _fetch<FeatureToProgId>(
    `${BASE_URL}/nodeIdToProgId/${nodeId}.json`,
  );

  // Array of [progId, iterCnt]
  const progIds = Object.keys(featureToProgId).flatMap((feature) => {
    const cpToProgId = featureToProgId[feature];
    return Object.keys(cpToProgId).map((cp) => cpToProgId[cp]);
  });

  return await Promise.all(
    progIds.map((pair) =>
      _fetch<string>(`${BASE_URL}/progIdToScript/${pair[0]}.json`),
    ),
  );
}

export { fetchFuncIdfromSecId, fetchStepToNodeId, fetchNodeIdToScript };

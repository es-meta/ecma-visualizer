import { SecIdToFunc, Test262IdToTest262 } from "@/types/data";
import { bitwiseOrStrings, convertToIndex, getBitString } from "../util/decode";
import { getAllFuncIds, isTemplateFuncInfo } from "./func-info";
type StepToNodeId = Record<string, number[]>;
type FeatureToProgId = Record<string, Record<string, [number, number]>>;
type FeatureToEncodedTest262 = Record<string, Record<string, string>>;

const minorVersion = str.getAB(__APP_VERSION__);

const BASE_URL = url.appendURL(minorVersion, import.meta.env.VITE_RESOURCE_URL);

async function _fetch<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw notFoundError();
    } else throw response;
  }
  return await response.json();
}

export async function fetchStepToNodeId(
  secId: string,
  step: string,
  map: SecIdToFunc,
): Promise<number[]> {
  const info = map[secId];
  const fetchNodeIds = (funcId: number) =>
    _fetch<StepToNodeId>(
      url.appendURL(`stepIdToNodeId/${funcId}.json`, BASE_URL),
    )
      .then((stepToNodeId) => stepToNodeId[step] ?? [])
      .catch(() => []);

  if (isTemplateFuncInfo(info)) {
    // the section is one template; every instance contributes its own nodes
    const perInstance = await Promise.all(
      getAllFuncIds(info).map(fetchNodeIds),
    );
    const nodeIds = [...new Set(perInstance.flat())];
    if (nodeIds.length > 0) return nodeIds;
  } else {
    // an ordinary section: exactly one of its functions owns the step
    for (const funcId of getAllFuncIds(info)) {
      const nodeIds = await fetchNodeIds(funcId);
      if (nodeIds.length > 0) return nodeIds;
    }
  }

  throw notFoundError();
}

export async function fetchAllTest262ByNodeId(
  nodeId: number,
  map: Test262IdToTest262,
): Promise<string[]> {
  const featureToEncoded = await fetchTest262FNCByNodeId(nodeId);

  const encodings = Object.keys(featureToEncoded).flatMap((feature) => {
    const cpToProgId = featureToEncoded[feature];
    return Object.keys(cpToProgId).map((cp) => cpToProgId[cp]);
  });

  let accBitString = "";
  encodings
    .filter((e) => e !== "")
    .forEach((encodeStrings) => {
      const bitString = getBitString(encodeStrings);
      if (accBitString === "") accBitString = bitString;
      else accBitString = bitwiseOrStrings(accBitString, bitString);
    });

  return await Promise.all(
    convertToIndex(accBitString).map((testId) => map[testId]),
  );
}

export async function fetchMinimalScriptByNodeId(nodeId: number) {
  const featureToProgId = await fetchFNCByNodeId(nodeId);
  const [progId, stepCnt] = featureToProgId["minimal"]["minimal"];

  return await fetchScriptByProgId(progId, stepCnt);
}

export async function fetchFNCByNodeId(nodeId: number) {
  return await _fetch<FeatureToProgId>(
    url.appendURL(`nodeIdToProgId/${nodeId}.json`, BASE_URL),
  );
}

export async function fetchTest262FNCByNodeId(nodeId: number) {
  return await _fetch<FeatureToEncodedTest262>(
    url.appendURL(`nodeIdToTest262/${nodeId}.json`, BASE_URL),
  );
}

export async function fetchScriptByProgId(
  progId: number,
  stepCount: number,
): Promise<[string, number]> {
  return [
    await _fetch<string>(
      url.appendURL(`progIdToScript/${progId}.json`, BASE_URL),
    ),
    stepCount,
  ];
}

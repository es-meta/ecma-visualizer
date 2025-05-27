import { SecIdToFunc, Test262IdToTest262 } from "@/types/data";
import { bitwiseOrStrings, convertToIndex, getBitString } from "../util/decode";
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
  const [id, , fallbacks] = map[secId] || [-1, undefined, []];
  const cadidates = [id, ...fallbacks].filter((n) => n >= 0);

  for (const funcId of cadidates) {
    const stepToNodeId = await _fetch<StepToNodeId>(
      url.appendURL(`stepIdToNodeId/${funcId}.json`, BASE_URL),
    );
    const result = stepToNodeId[step];
    if (result !== undefined) {
      return result;
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

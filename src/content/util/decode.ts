export function decodeBase64(b64: string): Uint8Array {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

const uncompressRLE = (compressed: string): string => {
  const parts = compressed.slice(1).split(".");

  const pairs = parts.slice(0, -1).reduce<[string, string][]>((acc, cur, i) => {
    if (i % 2 === 0) acc.push([cur, parts[i + 1]]);
    return acc;
  }, []);

  return pairs
    .map(([char, count]) => char.repeat(parseInt(count, 10)))
    .join("");
};

export const decode = (encoded: string): string[] => {
  const base64 = encoded.startsWith("@") ? uncompressRLE(encoded) : encoded;
  const bytes = decodeBase64(base64);
  const bits = bytes.reduce(
    (acc, byte) => acc + byte.toString(2).padStart(8, "0"),
    "",
  );
  return bits
    .split("")
    .reverse()
    .map((bit, index) => (bit === "1" ? index : -1))
    .filter((pos) => pos !== -1)
    .map((id) => id.toString());
};

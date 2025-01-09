const TestLength = 28876;

export function decodeBase64(b64: string): Uint8Array {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

export const decode = (encoded: string): string[] => {
  const paddingLength = (8 - (TestLength % 8)) % 8;
  const bits = decodeBase64(encoded)
    .reduce(
      (acc: string, byte: number) => acc + byte.toString(2).padStart(8, "0"),
      "",
    )
    .slice(paddingLength, paddingLength + TestLength);
  return bits
    .split("")
    .reverse()
    .map((bit, index) => (bit === "1" ? index : -1))
    .filter((pos) => pos !== -1)
    .map((id) => {
      return id.toString();
    });
};

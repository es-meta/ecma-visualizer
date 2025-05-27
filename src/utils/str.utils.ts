export function getAB(str: string) {
  // a.b.c => a.b, a.b => a.b
  return str.split(".").slice(0, 2).join(".");
}

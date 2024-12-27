export function extractStep(step: number, depth: number) {
  switch (depth % 3) {
    case 0:
      return step.toString();
    case 1:
      return AlphabetNumeral(step);
    case 2:
      return RomanNumeral(step);
    default:
      return "";
  }
}

function AlphabetNumeral(num: number) {
  const baseCharCode = "a".charCodeAt(0);
  return String.fromCharCode(baseCharCode + num - 1);
}

function RomanNumeral(num: number) {
  const romanMapping = [
    { value: 1000, symbol: "m" },
    { value: 900, symbol: "cm" },
    { value: 500, symbol: "d" },
    { value: 400, symbol: "cd" },
    { value: 100, symbol: "c" },
    { value: 90, symbol: "xc" },
    { value: 50, symbol: "l" },
    { value: 40, symbol: "xl" },
    { value: 10, symbol: "x" },
    { value: 9, symbol: "ix" },
    { value: 5, symbol: "v" },
    { value: 4, symbol: "iv" },
    { value: 1, symbol: "i" },
  ];

  let result = "";
  for (let i = 0; i < romanMapping.length; i++) {
    while (num >= romanMapping[i].value) {
      result += romanMapping[i].symbol;
      num -= romanMapping[i].value;
    }
  }

  return result;
}

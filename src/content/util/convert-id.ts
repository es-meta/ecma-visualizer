export function numToStep(step: number, depth: number) {
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

export function stepToNum(step: string): number[] {
  const split = step.split(".");

  return split.map((sp, idx) => {
    switch (idx % 3) {
      case 0:
        return parseInt(sp) as number;
      case 1:
        return sp.charAt(0).charCodeAt(0) - "a".charCodeAt(0) + 1;
      case 2:
        return RomanToNumber(sp);
      default:
        return 1;
    }
  });
}

function RomanToNumber(roman: string): number {
  const romanMapping: Record<string, number> = {
    m: 1000,
    cm: 900,
    d: 500,
    cd: 400,
    c: 100,
    xc: 90,
    l: 50,
    xl: 40,
    x: 10,
    ix: 9,
    v: 5,
    iv: 4,
    i: 1,
  };

  let result = 0;
  let i = 0;

  while (i < roman.length) {
    // Check for two-character symbols
    const twoCharSymbol = roman.substring(i, i + 2);
    if (romanMapping[twoCharSymbol] !== undefined) {
      result += romanMapping[twoCharSymbol];
      i += 2;
    } else {
      // Handle single-character symbols
      const oneCharSymbol = roman.charAt(i);
      if (romanMapping[oneCharSymbol] !== undefined) {
        result += romanMapping[oneCharSymbol];
        i++;
      } else {
        throw new Error(
          `Invalid Roman numeral at position ${i}: ${roman.charAt(i)}`,
        );
      }
    }
  }

  return result;
}

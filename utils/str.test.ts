import { expect, test } from "vitest";
import { getAB } from "./str.utils";

test("adds 1 + 2 to equal 3", () => {
  expect(getAB("1.1")).toBe("1.1");
  expect(getAB("1.1.1")).toBe("1.1");
  expect(getAB("1.2.3.4")).toBe("1.2");
});

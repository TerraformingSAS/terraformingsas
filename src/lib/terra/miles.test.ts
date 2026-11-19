import assert from "node:assert/strict";
import { test } from "node:test";
import { formatMiles, milesInputValue, parseMiles } from "./miles.ts";

test("formatea y lee montos con separador de miles colombiano", () => {
  assert.equal(formatMiles(5_000_000), "5.000.000");
  assert.equal(parseMiles("5.000.000"), 5_000_000);
  assert.equal(parseMiles("5000000"), 5_000_000);
  assert.equal(milesInputValue("5000000"), "5.000.000");
  assert.equal(parseMiles(""), "");
});

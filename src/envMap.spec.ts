import { combineEnvVars, EnvVars, fuzzyMatchObject } from "./envMap";
import test from "ava";

const testObj: Record<string, unknown> = Object.freeze({ test: 123 });

test("fuzzyMatchObject should work on identical keys", (t) => {
  const key = fuzzyMatchObject("test", testObj);

  t.is(testObj[key], 123);
});

test("fuzzyMatchObject should work on similar keys", (t) => {
  const key = fuzzyMatchObject("TeSt", testObj);

  t.is(testObj[key], 123);
});

test("combineEnvVars should work", (t) => {
  const envVars = {
    NAME: "fred",
    ARRAY_0_TEST: "test",
    NESTED_VALUE: "123",
  } as EnvVars;

  const options: Record<string, unknown> = {
    name: "bob",
    nested: {
      value: 456,
    },
    array: [{ test: "number 1" }, { test: "number 2" }, { test: "number 3" }],
  };

  const r = combineEnvVars(envVars, options);

  t.deepEqual(r, options, "options should be both mutated, and returned");
  t.deepEqual(r, {
    name: "fred",
    nested: { value: 123 },
    array: [{ test: "test" }, { test: "number 2" }, { test: "number 3" }],
  });
});

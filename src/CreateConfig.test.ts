import { Type } from "@sinclair/typebox";
import { CreateConfig } from "./CreateConfig";
import test from "ava";

test("CreateConfig Test", async (t) => {
  /**
   * Assert Same Type (Compile time test)
   */
  const AST = <Type>(a: Type) => a;

  /**
   * Config made from a single config schema
   */
  const flatConfig = await CreateConfig({
    schema: Type.Intersect([
      Type.Object({
        id: Type.String(),
      }),
    ]),
    value: {
      id: "test",
    },
  });

  t.is(AST<string>(flatConfig.get("id")), "test");

  /**
   * Composite config composed from multiple configuration schemas
   */
  const compositeConfig = await CreateConfig({
    schema: Type.Intersect([
      flatConfig.getSchema(),
      Type.Object({
        test: Type.Number(),
      }),
    ]),
    value: {
      id: "test",
      test: 123,
    },
  });

  t.is(AST<string>(compositeConfig.get("id")), "test");
  t.is(AST<number>(compositeConfig.get("test")), 123);
  t.is(AST<unknown>(compositeConfig.get("foo")), undefined);
});

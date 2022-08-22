import { Type } from "@sinclair/typebox";
import { CreateConfig } from "./CreateConfig";

/**
 * Assert Same Type
 */
const AST = <Type>(a: Type) => a;

if (require.main === module) test();

async function test() {
  /**
   * Config made from a single config schema
   */
  const flatConfig = await CreateConfig(
    Type.Intersect([
      Type.Object({
        id: Type.String(),
      }),
    ]),
    {
      id: "test",
    }
  );

  AST<string>(flatConfig.get("id"));

  /**
   * Composite config composed from multiple configuration schemas
   */
  const compositeConfig = await CreateConfig(
    Type.Intersect([
      flatConfig.getSchema(),
      Type.Object({
        test: Type.Number(),
      }),
    ])
  );

  AST<string>(compositeConfig.get("id"));
  AST<number>(compositeConfig.get("test"));
  AST<unknown>(compositeConfig.get("foo"));
}

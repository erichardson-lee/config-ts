import YAML from "yaml";
import merge from "deepmerge";

import { readFile } from "fs/promises";
import { Static, TSchema } from "@sinclair/typebox";
import { defaultLogger } from "./ErrorLogger";
import { join } from "path";
import { validateConfig, ValidationError } from "./ValidateConfig";

const readConfig = async <Type extends object = object>(
  path: string
): Promise<Type | undefined> => {
  try {
    const file = await readFile(path, { encoding: "utf-8" });

    const docs = YAML.parse(file);

    return docs;
  } catch {
    return undefined;
  }
};

/**
 * config files to load.
 * [0] loads last and overrides [1] etc.
 */
type ConfigPaths = readonly string[];

export const defaultConfigPaths: ConfigPaths = Object.freeze([
  join(process.cwd(), "./config.yml"),
  join(process.cwd(), "./config.yaml"),
  join(process.cwd(), `./config/${process.env.NODE_ENV ?? "development"}.yml`),
  join(process.cwd(), `./config/${process.env.NODE_ENV ?? "development"}.yaml`),
  join(process.cwd(), "./config/default.yml"),
  join(process.cwd(), "./config/default.yaml"),
]);

export const loadConfigFromFiles = async <ConfigSchema extends TSchema>(
  schema: ConfigSchema,
  configPaths: ConfigPaths = defaultConfigPaths,
  errorLogger = defaultLogger
): Promise<Static<ConfigSchema>> => {
  const configs: object[] = [];

  for (let i = configPaths.length - 1; i >= 0; i--) {
    const path = configPaths[i];

    const tmpConfig = await readConfig(path);

    if (!tmpConfig) continue;

    configs.push(tmpConfig);
  }

  if (configs.length === 0) {
    errorLogger(
      ["No Configs found", "---", "Searched Paths:", ...configPaths].join("\n")
    );
    process.exit(1);
  }

  const config = merge.all(configs);
  try {
    return validateConfig(schema, config);
  } catch (e) {
    if (e instanceof ValidationError) {
      errorLogger("Error Validating Config");
      e.errors.forEach((error) => {
        if (error.propertyName && error.data)
          errorLogger(
            `Property ${error.propertyName} value ${error.data} invalid.`
          );
        else if (error.message)
          errorLogger(`${error.instancePath} ${error.message}`);
        else errorLogger(JSON.stringify(error, undefined, 2));
      });

      process.exit(1);
    }
    throw e;
  }
};

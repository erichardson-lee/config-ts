import YAML from "yaml";
import merge from "deepmerge";

import { readFile } from "fs/promises";
import { Static, TSchema } from "@sinclair/typebox";
import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { defaultLogger } from "./ErrorLogger";
import { join } from "path";

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

export class ValidationError extends Error {
  constructor(
    public readonly errors: ErrorObject<string, Record<string, unknown>>[]
  ) {
    super(JSON.stringify(errors));
  }
}

const validateConfig = <ConfigSchema extends TSchema>(
  schema: ConfigSchema,
  value: unknown
): Static<ConfigSchema> => {
  const ajv = new Ajv({
    allErrors: true,
    validateFormats: true,
    verbose: true,
  });
  addFormats(ajv);

  const validate = ajv.compile(schema);

  const valid = validate(value);

  if (!valid) throw new ValidationError(validate.errors ?? []);

  return value;
};

/**
 * config files to load.
 * [0] loads last and overrides [1] etc.
 */
type ConfigPaths = readonly string[];

export const defaultConfigPaths: ConfigPaths = Object.freeze([
  join(process.cwd(), `./config.yml`),
  join(process.cwd(), `./config.yaml`),
  join(process.cwd(), `./config/${process.env.NODE_ENV ?? "development"}.yml`),
  join(process.cwd(), `./config/${process.env.NODE_ENV ?? "development"}.yaml`),
  join(process.cwd(), `./config/default.yml`),
  join(process.cwd(), `./config/default.yaml`),
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
        if (!error.propertyName || !error.data)
          errorLogger(JSON.stringify(error, undefined, 2));
        else
          errorLogger(
            `Property ${error.propertyName} value ${error.data} invalid.`
          );
      });

      errorLogger("Loaded Config from following files:");
      configPaths.forEach((path) => errorLogger(path));
      process.exit(1);
    }
    throw e;
  }
};

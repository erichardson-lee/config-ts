import { Static, Type, TObject } from "@sinclair/typebox";
import deepmerge from "deepmerge";
import { Configuration } from "./Configuration";
import { loadConfigFromFiles } from "./FileLoader";
import { getField, hasField } from "./GetField";
import { EnvVars, combineEnvVars } from "./envMap";
import { validateConfig } from "./ValidateConfig";

interface ConfigOptions<
  ConfigSchema extends TObject = TObject,
  ConfigType extends Static<ConfigSchema> = Static<ConfigSchema>
> {
  schema: ConfigSchema;
  value?: ConfigType;

  env?: {
    load?: boolean;
  };

  yaml?: {
    load?: boolean;
    paths?: string[];
  };

  errorLogger?: import("./ErrorLogger").ConfigErrorLogger;
}

export async function CreateConfig<
  ConfigSchema extends TObject,
  ConfigType extends Static<ConfigSchema>
>(
  opts: ConfigOptions<ConfigSchema, ConfigType>
): Promise<Configuration<ConfigSchema, ConfigType>> {
  const config = opts.value ?? (await loadConfig(opts));

  const get = <TPath extends string>(path: TPath) => getField(config, path);

  const has = <TPath extends string>(path: TPath) => hasField(config, path);

  return {
    get,
    has,
    getSchema: () => Type.Strict(opts.schema),
    getValues: () => config,
  };
}

async function loadConfig<
  ConfigSchema extends TObject,
  ConfigType extends Static<ConfigSchema>
>(opts: ConfigOptions<ConfigSchema, ConfigType>): Promise<ConfigType> {
  if (opts.value) return opts.value;

  let config: Partial<ConfigType> = {};

  if (opts?.yaml?.load) {
    const patch = await loadConfigFromFiles(
      opts.schema,
      opts.yaml.paths,
      opts.errorLogger
    );

    config = deepmerge(config, patch);
  }

  if (opts?.env?.load) {
    const env = EnvVars();

    combineEnvVars(env, config);
  }

  return validateConfig<ConfigSchema, ConfigType>(opts.schema, config);
}

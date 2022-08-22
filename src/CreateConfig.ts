import { Static, Type, TSchema } from "@sinclair/typebox";
import { Configuration } from "./Configuration";
import { defaultLogger } from "./ErrorLogger";
import { defaultConfigPaths, loadConfigFromFiles } from "./FileLoader";
import { getField, hasField } from "./GetField";

export async function CreateConfig<
  ConfigSchema extends TSchema,
  ConfigType extends Static<ConfigSchema>
>(
  configSchema: ConfigSchema,
  configValue?: ConfigType,
  errorLogger = defaultLogger
): Promise<Configuration<ConfigSchema, ConfigType>> {
  const config =
    configValue ??
    ((await loadConfigFromFiles(
      configSchema,
      defaultConfigPaths,
      errorLogger
    )) as ConfigType);

  const get = <TPath extends string>(path: TPath) => getField(config, path);

  const has = <TPath extends string>(path: TPath) => hasField(config, path);

  return {
    get,
    has,
    getSchema: () => Type.Strict(configSchema),
    getValues: () => config,
  };
}

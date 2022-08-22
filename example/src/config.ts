import { Configuration, CreateConfig } from "@erichardson-lee/config-ts";
import { Type, Static } from "@sinclair/typebox";
import { writeFile } from "fs/promises";
import { join } from "path";

export type ConfigData = Static<typeof ConfigData>;
export const ConfigData = Type.Object({
  name: Type.String({ description: "The name to greet" }),

  favourite_foods: Type.Array(
    Type.Object({ name: Type.String({ description: "name of the food" }) }),
    { description: "A List of favourite foods" }
  ),
});

// Only run following code if this file is directly called
if (require.main === module) {
  writeFile(
    join(__dirname, "../config.schema.json"),
    JSON.stringify(Type.Strict(ConfigData), undefined, 2)
  ).then(() => console.log("Successfully exported config schema"));
}

const createConfig = async () => await CreateConfig(ConfigData);

let config: Configuration<typeof ConfigData, ConfigData>;
export const initConfig = async () => {
  if (config) throw new Error("Config has already been initialized");

  config = await createConfig();
  return config;
};

export const getConfig = () => {
  if (!config) throw new Error("Config hasn't been initialized");

  return config;
};

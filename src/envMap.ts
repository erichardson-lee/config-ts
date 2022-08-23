import { getField } from "./GetField";

export type EnvVars = Record<string, string | undefined> & never;

export const fuzzyMatchObject = (
  key: string,
  object: Record<string, unknown>
): string => {
  const keys = Object.keys(object);

  const validKeys: string[] = keys.filter(
    (k) => k.toLocaleUpperCase() === key.toLocaleUpperCase()
  );

  const len = validKeys.length;

  if (len === 0) {
    throw new Error(`No valid keys found for ${key}`);
  } else if (len === 1) {
    return validKeys[0];
  } else {
    throw new Error("Multiple valid keys found: \n" + validKeys.join("\n"));
  }
};

/**
 * Get env vars
 * @returns an object containing all environment variables prefixed with CONFIGTS_ and their values
 */
export const EnvVars = (): EnvVars => {
  return Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => /^CONFIGTS_/.test(key))
      .map(([k, v]) => [k.slice("CONFIGTS_".length), v])
  ) as EnvVars;
};

/**
 * Combine environment variables into an options object, modifying it in place.
 * @param envVars The list of environment variables to try merging
 * @param options The options to merge into. These WILL be modified in place
 * @returns The _now modified_ options object.
 */
export function combineEnvVars<Options extends Record<string, unknown>>(
  envVars: EnvVars,
  options: Options
): Options {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label
  // ⬇ this is a label on a loop. They are an obscure, but cool, feature.
  outerLoop: for (const env of Object.keys(envVars)) {
    try {
      const envValue = envVars[env];
      if (!envValue) continue;

      const sections: string[] = [];

      innerLoop: for (const layer of env.split("_")) {
        // if the section is only digits,
        const res = /^(?<number>\d+)$/.exec(layer);

        if (res?.groups?.number) {
          sections.push(`[${res.groups.number}]`);
          continue innerLoop;
        }

        const field = getField(options, sections.join("."));
        if (typeof field !== "object" || field === null) continue outerLoop;

        const key = fuzzyMatchObject(
          layer,
          field as unknown as Record<string, unknown>
        );

        sections.push(key);
      }

      const lastOption = sections.pop();

      const newVar = /^\d*$/.test(envValue) ? parseFloat(envValue) : envValue;

      //@ts-expect-error allow type errors for fun/profit
      getField(options, sections.join("."))[lastOption] = newVar;
    } catch (e) {
      console.error(e);
      continue;
    }
  }
  return options;
}

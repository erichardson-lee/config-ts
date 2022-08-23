import { Static, TSchema } from "@sinclair/typebox";
import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";

export class ValidationError extends Error {
  constructor(
    public readonly errors: ErrorObject<string, Record<string, unknown>>[]
  ) {
    super(JSON.stringify(errors));
  }
}

export const validateConfig = <
  ConfigSchema extends TSchema,
  ConfigType extends Static<ConfigSchema> = Static<ConfigSchema>
>(
  schema: ConfigSchema,
  value: unknown
): ConfigType => {
  const ajv = new Ajv({
    allErrors: true,
    validateFormats: true,
    verbose: true,
  });
  addFormats(ajv);

  const validate = ajv.compile(schema);

  const valid = validate(value);

  if (!valid) throw new ValidationError(validate.errors ?? []);

  return value as ConfigType;
};

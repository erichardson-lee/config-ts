import { GetFieldType, IsField } from "./GetField";
import { TSchema, Static } from "@sinclair/typebox";

export interface Configuration<
  ConfigSchema extends TSchema,
  ConfigType extends Static<ConfigSchema>
> {
  get<TPath extends string>(path: TPath): GetFieldType<ConfigType, TPath>;
  has<TPath extends string>(
    path: TPath
  ): IsField<ConfigType, TPath> extends never ? false : true;

  getSchema(): ConfigSchema;
  getValues(): ConfigType;
}

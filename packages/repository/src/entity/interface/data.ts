export type UserDefinedSchema = Record<string, any>

export type EntitySchema<TInput extends UserDefinedSchema = UserDefinedSchema> =
  TInput["id"] extends unknown
    ? Omit<TInput, "id"> & { id: string }
    : TInput & { id: string }

export type AllowedEntityInput<TSchema = EntitySchema> = Partial<
  Omit<TSchema, "id">
>

export type EntityData<TActualData extends AllowedEntityInput> = TActualData & {
  id: string
}

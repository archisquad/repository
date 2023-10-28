import { Simplify } from "type-fest"

export type UserDefinedSchema = Record<string, any>

export type EntitySchema<TInput extends UserDefinedSchema = UserDefinedSchema> =
  Simplify<Omit<TInput, "id"> & { id: string }>

export type AllowedEntityInput<TSchema = EntitySchema> = Partial<
  Omit<TSchema, "id">
>

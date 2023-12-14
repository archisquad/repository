import { IsStringLiteral } from "type-fest"

export type EntitySchema = Record<string, any>

export type Validator<TSchema, TInputSchema> = (
  schema: TSchema,
  data: any
) => TInputSchema

export type Identifier<TSchema> = keyof TSchema | ((data: TSchema) => any)
type DefaultIdentifier = string

/**
 * To determine if the identifier is defined, we checking for union function with
 * undefined (for functions) or checking if the identifier is a string literal (for
 * using key of TSchema). If the identifier is undefined, we return the default (string)
 */
export type ResolveIdentifier<TSchema, TIdentifier> = [TIdentifier] extends [
  ((data: TSchema) => any) | undefined,
]
  ? TIdentifier extends (data: TSchema) => infer ReturnedIdentifier
    ? ReturnedIdentifier
    : DefaultIdentifier
  : IsStringLiteral<TIdentifier> extends true
    ? TIdentifier extends keyof TSchema
      ? TSchema[TIdentifier]
      : DefaultIdentifier
    : DefaultIdentifier

export type UpdateEntityInput<
  TSchema,
  TIdentifier extends Identifier<TSchema> | undefined,
> = [TIdentifier] extends [((data: TSchema) => any) | undefined]
  ? TSchema
  : IsStringLiteral<TIdentifier> extends true
    ? TIdentifier extends keyof TSchema
      ? Omit<TSchema, TIdentifier>
      : TSchema
    : Omit<TSchema, "id">

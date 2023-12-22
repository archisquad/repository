import type { EntitySchema, Identifier, ResolveIdentifier } from "./interface"

export type GetIdentifierFn<TSchema, TIdentifier> = (
  data: TSchema
) => ResolveIdentifier<TSchema, TIdentifier>

export function getIdentifier<
  TSchema extends EntitySchema,
  TIdentifier extends Identifier<TSchema> | undefined,
>(identifier?: TIdentifier): GetIdentifierFn<TSchema, TIdentifier> {
  if (!identifier) {
    return ((data: TSchema) => data.id) as GetIdentifierFn<TSchema, TIdentifier>
  }

  if (typeof identifier === "string") {
    return ((data: TSchema) => data[identifier]) as GetIdentifierFn<
      TSchema,
      TIdentifier
    >
  }

  return identifier as GetIdentifierFn<TSchema, TIdentifier>
}

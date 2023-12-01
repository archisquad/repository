import { EntitySchema, Identifier, ResolveIdentifier } from "./interface"

export type GetIdentifierFn<TSchema, TIdentifier> = (
  data: TSchema
) => ResolveIdentifier<TSchema, TIdentifier>

export function getIdentifier<
  TSchema extends EntitySchema,
  TIdentifier extends Identifier<TSchema> | undefined,
>(identifier?: TIdentifier): GetIdentifierFn<TSchema, TIdentifier> {
  if (!identifier) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return ((data: TSchema) => data.id) as GetIdentifierFn<TSchema, TIdentifier>
  }

  if (typeof identifier === "string") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return ((data: TSchema) => data[identifier]) as GetIdentifierFn<
      TSchema,
      TIdentifier
    >
  }

  return identifier as GetIdentifierFn<TSchema, TIdentifier>
}

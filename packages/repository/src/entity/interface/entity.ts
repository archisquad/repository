import { DeepReadonly } from "../types"
import { EntitySchema, Identifier, ResolveIdentifier } from "./data"
import { Methods, ResolvedMethods } from "./methods"
import { RelationshipsDefinitions, ResolvedRelations } from "./relations"

type UpdateMethod<
  TSchema extends EntitySchema,
  TMethods extends Methods<TSchema> | undefined,
  TRelations extends RelationshipsDefinitions<TSchema> | undefined,
  TIdentifier extends Identifier<TSchema> | undefined = undefined,
> = {
  update(data: TSchema): Entity<TSchema, TMethods, TRelations, TIdentifier>
}

export type GetIdentifierMethod<TSchema, TIdentifier> = {
  getIdentifier: () => ResolveIdentifier<TSchema, TIdentifier>
}

export type Entity<
  TSchema extends EntitySchema,
  TMethods extends Methods<TSchema> | undefined = undefined,
  TRelations extends RelationshipsDefinitions<TSchema> | undefined = undefined,
  TIdentifier extends Identifier<TSchema> | undefined = undefined,
> = DeepReadonly<TSchema> &
  UpdateMethod<TSchema, TMethods, TRelations> &
  GetIdentifierMethod<TSchema, TIdentifier> &
  ResolvedMethods<TSchema, TMethods> &
  ResolvedRelations<TSchema, TRelations>

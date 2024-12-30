import type { Opaque, PartialDeep } from "type-fest"
import type { DeepReadonly } from "../deepReadonly"
import type {
  EntitySchema,
  Identifier,
  ResolveIdentifier,
  UpdateEntityInput,
} from "./data"
import type { Methods, ResolvedMethods } from "./methods"
import type { RelationshipsDefinitions, ResolvedRelations } from "./relations"

export type EntityKey = Opaque<string, "entity-key">

type UpdateMethod<
  TSchema extends EntitySchema,
  TMethods extends Methods<TSchema> | undefined,
  TRelations extends RelationshipsDefinitions<TSchema> | undefined,
  TIdentifier extends Identifier<TSchema> | undefined,
> = {
  update(
    data: PartialDeep<UpdateEntityInput<TSchema, TIdentifier>>
  ): Entity<TSchema, TMethods, TRelations, TIdentifier>
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
  UpdateMethod<TSchema, TMethods, TRelations, TIdentifier> &
  GetIdentifierMethod<TSchema, TIdentifier> &
  ResolvedMethods<TSchema, TMethods> &
  ResolvedRelations<TSchema, TRelations>

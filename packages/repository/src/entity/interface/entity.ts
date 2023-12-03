import { DeepReadonly } from "../types"
import { AllowedEntityInput, EntitySchema } from "./data"
import { Methods, ResolvedMethods } from "./methods"
import { RelationshipsDefinitions, ResolvedRelations } from "./relations"

type UpdateMethod<
  TSchema extends EntitySchema,
  TMethods extends Methods<TSchema> | undefined,
  TRelations extends RelationshipsDefinitions<TSchema> | undefined,
> = {
  update(
    data: AllowedEntityInput<TSchema>
  ): Entity<TSchema, TMethods, TRelations>
}

export type Entity<
  TSchema extends EntitySchema,
  TMethods extends Methods<TSchema> | undefined = undefined,
  TRelations extends RelationshipsDefinitions<TSchema> | undefined = undefined,
> = DeepReadonly<TSchema> &
  UpdateMethod<TSchema, TMethods, TRelations> &
  ResolvedMethods<TSchema, TMethods> &
  ResolvedRelations<TSchema, TRelations>

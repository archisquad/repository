import { EntitySchema } from "./data"
import { RepositoryKey } from "src/repositoryKey"
import { IsStringLiteral, Simplify } from "type-fest"

type RelationshipTypes = "has-many" | "belongs-to"

export interface Relationship<
  TSchema extends EntitySchema,
  TForeignRepository extends RepositoryKey<Record<string, any>, string>,
> {
  type: RelationshipTypes
  foreignRepository: TForeignRepository
  foreignKey: keyof TForeignRepository["__schema"]
  localKey: keyof TSchema
}

export type RelationshipsDefinitions<
  TSchema extends EntitySchema,
  TDefinitions extends Relationship<TSchema, any> = Relationship<TSchema, any>,
> = Record<string, TDefinitions>

type RelationshipAccessMethods<
  TSchema extends EntitySchema,
  TRelations extends RelationshipsDefinitions<TSchema>,
> = {
  -readonly [Key in keyof TRelations]: TRelations[Key]["type"] extends "belongs-to"
    ? () => Simplify<TRelations[Key]["foreignRepository"]["__schema"]>
    : () => Simplify<TRelations[Key]["foreignRepository"]["__schema"]>[]
}

export type ResolvedRelations<
  TSchema extends EntitySchema,
  TRelations extends RelationshipsDefinitions<TSchema> | undefined,
> = TRelations extends RelationshipsDefinitions<TSchema>
  ? IsStringLiteral<keyof TRelations> extends true
    ? RelationshipAccessMethods<TSchema, NonNullable<TRelations>>
    : {}
  : {}

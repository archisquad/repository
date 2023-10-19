/* eslint-disable @typescript-eslint/no-explicit-any */
import { RepositoryKey } from "src/repositoryKey"
import { UnionToIntersection } from "type-fest"

type RelationshipTypes = "has-many" | "belongs-to"

export interface Relationship<
  TLocalSchema,
  TForeignRepository extends RepositoryKey<any, any> = RepositoryKey<
    Record<string, any>,
    string
  >,
> {
  id: string
  type: RelationshipTypes
  foreignRepository: TForeignRepository
  foreignKey: keyof TForeignRepository["__schema"]
  localKey: keyof TLocalSchema
}

export type FindForeignSchemaInDefinitions<TDefinitions, TID> =
  TDefinitions extends {
    id: TID
    foreignRepository: infer TForeignRepository
  }
    ? TForeignRepository extends RepositoryKey<infer TForeignSchema, any>
      ? TForeignSchema
      : never
    : never

export type ForeignType<
  TDefinitions extends { id: string },
  TRelationName extends TDefinitions["id"],
  TRelationType extends RelationshipTypes,
> = TRelationType extends "has-many"
  ? FindForeignSchemaInDefinitions<TDefinitions, TRelationName>[]
  : FindForeignSchemaInDefinitions<TDefinitions, TRelationName>

export type Relations<TDefinitions> = UnionToIntersection<
  TDefinitions extends {
    id: string
    type: infer TRelationType extends RelationshipTypes
  }
    ? {
        [Key in TDefinitions["id"]]: () => ForeignType<
          TDefinitions,
          Key,
          TRelationType
        >
      }
    : never
>

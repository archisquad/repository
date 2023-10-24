import { DeepReadonly } from "../types"
import { AllowedEntityInput, EntitySchema } from "./data"
import { Relations, Relationship } from "./relations"
import { SyncKey } from "./sync"

type DetectEmptyArray<TArr> = TArr extends never[] | [] ? true : false

type RelationsCleaner<
  TSchema extends EntitySchema,
  TRelations extends Relationship<TSchema>[] = [],
> = DetectEmptyArray<TRelations> extends true
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : Relations<TRelations[number]>

export type Entity<
  TSchema extends EntitySchema,
  TRelations extends Relationship<TSchema>[] = [],
> = DeepReadonly<TSchema> & {
  update<const TUpdatedData extends AllowedEntityInput<TSchema>>(
    data: TUpdatedData
  ): Entity<TSchema, TRelations>
  toObject(): TSchema
  toJson(): string
  isSynced(id: SyncKey): boolean
  setSynced(id: SyncKey, promise: Promise<unknown>): void
} & RelationsCleaner<TSchema, TRelations>

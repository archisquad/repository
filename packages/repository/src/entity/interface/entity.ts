import { DeepReadonly } from "../types"
import { AllowedEntityInput, EntitySchema } from "./data"
import { Relations, Relationship } from "./relations"
import { SyncKey } from "./sync"
import { EmptyObject, Except } from "type-fest"

type DetectEmptyArray<TArr> = TArr extends never[] | [] ? true : false

type ResolvedRelations<
  TSchema extends EntitySchema,
  TRelations extends Relationship<TSchema>[],
> = DetectEmptyArray<TRelations> extends true
  ? EmptyObject
  : Relations<TRelations[number]>

export type Methods<TSchema extends EntitySchema> = Record<
  string,
  (this: TSchema, ...args: any[]) => any
>

type PrototypeMethods<
  TSchema extends EntitySchema,
  TRelations extends Relationship<TSchema>[],
> = {
  update<const TUpdatedData extends AllowedEntityInput<TSchema>>(
    data: TUpdatedData
  ): Entity<TSchema, TRelations>
  toObject(): TSchema
  toJson(): string
  isSynced(id: SyncKey): boolean
  setSynced(id: SyncKey, promise: Promise<unknown>): void
}

export type Entity<
  TSchema extends EntitySchema,
  TRelations extends Relationship<TSchema>[] = [],
  TMethods extends Methods<TSchema> = EmptyObject,
> = DeepReadonly<TSchema> &
  PrototypeMethods<TSchema, TRelations> &
  Except<TMethods, keyof PrototypeMethods<TSchema, TRelations>> &
  ResolvedRelations<TSchema, TRelations>

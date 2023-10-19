import { DeepReadonly } from "../types"
import { AllowedEntityInput, EntityData, EntitySchema } from "./data"
import { SyncKey } from "./sync"

export type EntityPrototype<
  TSchema extends EntitySchema,
  TActualData extends EntityData<AllowedEntityInput<TSchema>>,
> = {
  get data(): DeepReadonly<TActualData>
  update<TUpdatedData extends AllowedEntityInput<TSchema>>(
    data: TUpdatedData
  ): EntityPrototype<TSchema, TActualData & TUpdatedData>
  toJson(): string
  toObject(): DeepReadonly<TActualData>
  isSynced(id: SyncKey): boolean
  setSynced(id: SyncKey, promise: Promise<unknown>): void
}

export type ProxyTarget = {
  proto: any
  relationAccessor: any
}

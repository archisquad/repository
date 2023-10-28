import { DeepReadonly } from "../types"
import { AllowedEntityInput, EntitySchema } from "./data"
import { SyncKey } from "./sync"

export type EntityPrototype<TSchema extends EntitySchema> = {
  get data(): DeepReadonly<TSchema>
  update(data: AllowedEntityInput<TSchema>): EntityPrototype<TSchema>
  toJson(): string
  toObject(): DeepReadonly<TSchema>
  isSynced(id: SyncKey): boolean
  setSynced(id: SyncKey, promise: Promise<unknown>): void
}

export type ProxyTarget = {
  proto: any
  relationAccessor: any
}

import { DeepReadonly } from "../types"
import { EntitySchema, Identifier, ResolveIdentifier } from "./data"
import { SyncKey } from "./sync"

export type EntityPrototype<
  TSchema extends EntitySchema,
  TIdentifier extends Identifier<TSchema> | undefined,
> = {
  get data(): DeepReadonly<TSchema>
  update(data: TSchema): EntityPrototype<TSchema, TIdentifier>
  toJson(): string
  toObject(): DeepReadonly<TSchema>
  isSynced(id: SyncKey): boolean
  setSynced(id: SyncKey, promise: Promise<unknown>): void
  getIdentifier(): ResolveIdentifier<TSchema, TIdentifier>
}

export type ProxyTarget = {
  proto: any
  relationAccessor: any
}

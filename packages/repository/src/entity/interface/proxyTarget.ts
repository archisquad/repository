import type { PartialDeep } from "type-fest"
import type { DeepReadonly } from "../deepReadonly"
import type {
  EntitySchema,
  Identifier,
  ResolveIdentifier,
  UpdateEntityInput,
} from "./data"
import type { SyncKey } from "../../network/interface/sync"

export type EntityPrototype<
  TSchema extends EntitySchema,
  TIdentifier extends Identifier<TSchema> | undefined,
> = {
  get data(): DeepReadonly<TSchema>
  update(
    data: PartialDeep<UpdateEntityInput<TSchema, TIdentifier>>
  ): EntityPrototype<TSchema, TIdentifier>
  toJson(): string
  toObject(): TSchema
  isSynced(id: SyncKey): boolean
  setSynced(id: SyncKey, promise: Promise<unknown>): void
  getIdentifier(): ResolveIdentifier<TSchema, TIdentifier>
}

export type ProxyTarget = {
  internalEntity: any
  relationAccessor: any
}

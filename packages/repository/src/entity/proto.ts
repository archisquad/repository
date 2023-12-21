import { deepReadonly } from "./deepReadonly"
import { GetIdentifierFn } from "./identifier"
import {
  EntitySchema,
  Identifier,
  ResolveIdentifier,
  SyncKey,
  UpdateEntityInput,
} from "./interface"
import { SyncMap } from "./sync"
import { DeepReadonly } from "./types"

export function internalEntityFactory<
  TSchema extends EntitySchema,
  TIdentifier extends Identifier<TSchema> | undefined,
>(
  syncDestinations: SyncKey[],
  validatorFn: (data: any) => TSchema,
  identifierFn: GetIdentifierFn<TSchema, TIdentifier>
) {
  return class EntityInternal {
    private _data: DeepReadonly<TSchema>
    private _syncMap: SyncMap

    constructor(data: TSchema) {
      this._data = deepReadonly({
        ...validatorFn(data),
      })
      this._syncMap = new SyncMap(syncDestinations)
    }

    public get data(): DeepReadonly<TSchema> {
      return this._data
    }

    public getIdentifier(): ResolveIdentifier<TSchema, TIdentifier> {
      return identifierFn(this._data as TSchema)
    }

    public update(
      data: UpdateEntityInput<TSchema, TIdentifier>
    ): EntityInternal {
      return new EntityInternal({
        ...this._data,
        ...data,
        // TODO: Remove it - identifier is selected by user
        id: this._data.id,
      } as TSchema)
    }

    public toJson(): string {
      return JSON.stringify(this._data)
    }

    public toObject(): DeepReadonly<TSchema> {
      // This should be cloned
      return this._data
    }

    public isSynced(id: SyncKey): boolean {
      return this._syncMap.checkStatus(id)
    }

    public setSynced(id: SyncKey, promise: Promise<unknown>): void {
      this._syncMap.setStatus(id, promise)
    }
  }
}

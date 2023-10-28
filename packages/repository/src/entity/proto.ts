import { deepReadonly } from "./deepReadonly"
import { AllowedEntityInput, EntitySchema, SyncKey } from "./interface"
import { SyncMap } from "./sync"
import { DeepReadonly } from "./types"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createInternalEntity<TSchema extends EntitySchema>(
  syncIds: SyncKey[]
) {
  return class EntityInternal {
    private _data: DeepReadonly<TSchema>
    private _syncMap: SyncMap

    constructor(data: TSchema) {
      this._data = deepReadonly({
        ...data,
      })
      this._syncMap = new SyncMap(syncIds)
    }

    public get data(): DeepReadonly<TSchema> {
      return this._data
    }

    public update(data: AllowedEntityInput<TSchema>): EntityInternal {
      return new EntityInternal({
        ...this._data,
        ...data,
        id: this._data.id,
      } as TSchema)
    }

    public toJson(): string {
      return JSON.stringify(this._data)
    }

    public toObject(): DeepReadonly<TSchema> {
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

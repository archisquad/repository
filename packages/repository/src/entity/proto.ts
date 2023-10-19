import { deepReadonly } from "./deepReadonly"
import {
  AllowedEntityInput,
  EntityData,
  EntitySchema,
  SyncKey,
} from "./interface"
import { SyncMap } from "./sync"
import { DeepReadonly } from "./types"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createInternalEntity<TSchema extends EntitySchema>(
  syncIds: SyncKey[]
) {
  return class EntityInternal<
    TActualData extends EntityData<AllowedEntityInput<TSchema>>,
  > {
    private _data: DeepReadonly<TActualData>
    private _syncMap: SyncMap

    constructor(data: TActualData) {
      this._data = deepReadonly({
        ...data,
      })
      this._syncMap = new SyncMap(syncIds)
    }

    public get data(): DeepReadonly<TActualData> {
      return this._data
    }

    public update<TUpdatedData extends AllowedEntityInput<TSchema>>(
      data: TUpdatedData
    ): EntityInternal<TActualData & TUpdatedData> {
      return new EntityInternal<TActualData & TUpdatedData>({
        ...(this._data as TActualData),
        ...data,
        id: this._data.id,
      })
    }

    public toJson(): string {
      return JSON.stringify(this._data)
    }

    public toObject(): DeepReadonly<TActualData> {
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

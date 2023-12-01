import { deepReadonly } from "./deepReadonly"
import { GetIdentifierFn } from "./identifier"
import {
  AllowedEntityInput,
  EntitySchema,
  Identifier,
  ResolveIdentifier,
  SyncKey,
} from "./interface"
import { SyncMap } from "./sync"
import { DeepReadonly } from "./types"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- that's ESLint bug
      return identifierFn(this._data as TSchema)
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

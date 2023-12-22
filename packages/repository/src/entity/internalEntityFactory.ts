import type { PartialDeep } from "type-fest"
import type { DeepReadonly } from "./deepReadonly"
import type { GetIdentifierFn } from "./identifier"
import type {
  EntitySchema,
  Identifier,
  ResolveIdentifier,
  UpdateEntityInput,
} from "./interface"
import { deepReadonly } from "./deepReadonly"

export function internalEntityFactory<
  TSchema extends EntitySchema,
  TIdentifier extends Identifier<TSchema> | undefined,
>(
  validatorFn: (data: any) => TSchema,
  identifierFn: GetIdentifierFn<TSchema, TIdentifier>
) {
  return class EntityInternal {
    private _data: DeepReadonly<TSchema>

    constructor(data: TSchema) {
      this._data = deepReadonly({
        ...validatorFn(data),
      })
    }

    public get data(): DeepReadonly<TSchema> {
      return this._data
    }

    public getIdentifier(): ResolveIdentifier<TSchema, TIdentifier> {
      return identifierFn(this._data as TSchema)
    }

    public update(
      data: PartialDeep<UpdateEntityInput<TSchema, TIdentifier>>
    ): EntityInternal {
      // We're not protecting against updating the identifier here in runtime.
      // For such changes we should take another function as parameter or
      // change this class to inline calls inside the factory.
      return new EntityInternal({
        ...this._data,
        ...data,
      } as TSchema)
    }

    public toJson(): string {
      return JSON.stringify(this._data)
    }

    public toObject(): TSchema {
      return structuredClone(this._data) as TSchema
    }
  }
}

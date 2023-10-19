/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { generateId } from "./generateId"
import {
  AllowedEntityInput,
  Entity,
  EntityData,
  EntityPrototype,
  EntitySchema,
  ProxyTarget,
  Relationship,
  SyncKey,
  UserDefinedSchema,
} from "./interface"
import { createInternalEntity } from "./proto"
import { proxyHandlerFactory } from "./proxyHandlerFactory"
import { relationAccessorFactory } from "./relationsAccessor"

export function entityModelFactory<TInputSchema extends UserDefinedSchema>() {
  type ModelSchema = EntitySchema<TInputSchema>

  return <
    const TDefinition extends
      Relationship<ModelSchema> = Relationship<ModelSchema>,
  >(
    definitions: TDefinition[] = [],
    syncKeys: SyncKey[] = []
  ) => {
    const relationAccessor =
      definitions.length > 0 ? relationAccessorFactory(definitions) : {}

    const internalEntityClass = createInternalEntity<ModelSchema>(syncKeys)

    const proxyHandler = proxyHandlerFactory<ProxyTarget>(updateEntity)

    function updateEntity<TUpdatedData extends AllowedEntityInput<ModelSchema>>(
      this: { proto: EntityPrototype<ModelSchema, EntityData<ModelSchema>> },
      updatedData: TUpdatedData
    ): any {
      const updatedInternalEntity = this.proto.update(updatedData)

      const proxyTarget = createProxyTarget(updatedInternalEntity)

      return new Proxy(proxyTarget, proxyHandler)
    }

    function createProxyTarget<TInternalEntity>(
      internalEntity: TInternalEntity
    ) {
      return {
        proto: internalEntity,
        relationAccessor: relationAccessor,
      }
    }

    function createEntity<TInputData extends AllowedEntityInput<ModelSchema>>(
      inputData: TInputData
    ) {
      const id = generateId()
      const data = { ...inputData, id } satisfies EntityData<TInputData>

      const internalEntity = new internalEntityClass(data)

      const proxyTarget = createProxyTarget(internalEntity)

      return new Proxy(proxyTarget, proxyHandler) as unknown as Entity<
        ModelSchema,
        typeof data,
        typeof definitions
      >
    }

    function recoverEntity(serializedData: string) {
      const data = JSON.parse(serializedData) as EntityData<
        AllowedEntityInput<ModelSchema>
      >
      const internalEntity = new internalEntityClass(data)

      const proxyTarget = createProxyTarget(internalEntity)

      return new Proxy(proxyTarget, proxyHandler) as unknown as Entity<
        ModelSchema,
        typeof data,
        typeof definitions
      >
    }

    return {
      createEntity,
      recoverEntity,
    }
  }
}

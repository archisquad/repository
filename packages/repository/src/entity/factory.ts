/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { generateId } from "./generateId"
import {
  AllowedEntityInput,
  Entity,
  EntityPrototype,
  EntitySchema,
  Methods,
  ProxyTarget,
  Relationship,
  SyncKey,
  UserDefinedSchema,
  Validator,
} from "./interface"
import { createInternalEntity } from "./proto"
import { proxyHandlerFactory } from "./proxyHandlerFactory"
import { relationAccessorFactory } from "./relationsAccessor"
import { validateInput } from "./validation"

export function entityModelFactory<
  TSchema,
  TInputSchema extends UserDefinedSchema,
  TMethods extends Methods<EntitySchema<TInputSchema>> | undefined,
  const TDefinition extends Relationship<
    EntitySchema<TInputSchema>
  > = Relationship<EntitySchema<TInputSchema>>,
>(configObj: {
  schema: TSchema
  inferSchema: (data: TSchema) => TInputSchema
  validator?: Validator<TSchema, TInputSchema>
  methods?: TMethods
  definitions?: TDefinition[]
  syncDestinations?: SyncKey[]
}) {
  type ModelSchema = EntitySchema<TInputSchema>

  const {
    schema,
    definitions = [],
    syncDestinations = [],
    methods = {},
    validator = (schema: TSchema, data: unknown) => data as TInputSchema,
  } = configObj

  // TODO: The user should define the schema without any dynamically added ID
  validateInput(schema as unknown as ModelSchema, methods, definitions)

  const relationAccessor =
    definitions.length > 0 ? relationAccessorFactory(definitions) : {}

  const validatorFn = (data: unknown) => validator(schema, data)
  const internalEntityClass = createInternalEntity<ModelSchema>(
    syncDestinations,
    validatorFn as unknown as (data: any) => ModelSchema
  )

  const proxyHandler = proxyHandlerFactory<ProxyTarget>(updateEntity, methods)

  function updateEntity<TUpdatedData extends AllowedEntityInput<ModelSchema>>(
    this: { proto: EntityPrototype<ModelSchema> },
    updatedData: TUpdatedData
  ): any {
    const updatedInternalEntity = this.proto.update(updatedData)

    const proxyTarget = createProxyTarget(updatedInternalEntity)

    return new Proxy(proxyTarget, proxyHandler)
  }

  function createProxyTarget<TInternalEntity>(internalEntity: TInternalEntity) {
    return {
      proto: internalEntity,
      relationAccessor: relationAccessor,
    }
  }

  function createEntity<TInputData extends AllowedEntityInput<ModelSchema>>(
    inputData: TInputData
  ) {
    const id = generateId()
    const data = { ...inputData, id } as unknown as ModelSchema

    const internalEntity = new internalEntityClass(data)

    const proxyTarget = createProxyTarget(internalEntity)

    return new Proxy(proxyTarget, proxyHandler) as unknown as Entity<
      ModelSchema,
      TMethods,
      typeof definitions
    >
  }

  function recoverEntity(serializedData: string) {
    const data = JSON.parse(serializedData) as ModelSchema
    const internalEntity = new internalEntityClass(data)

    const proxyTarget = createProxyTarget(internalEntity)

    return new Proxy(proxyTarget, proxyHandler) as unknown as Entity<
      ModelSchema,
      TMethods,
      typeof definitions
    >
  }

  return {
    createEntity,
    recoverEntity,
  }
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { generateId } from "./generateId"
import {
  AllowedEntityInput,
  Entity,
  EntityPrototype,
  EntitySchema,
  Methods,
  ProxyTarget,
  RelationshipsDefinitions,
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
  const TDefinitions extends RelationshipsDefinitions<
    EntitySchema<TInputSchema>
  >,
>(configObj: {
  schema: TSchema
  inferSchema: (data: TSchema) => TInputSchema
  validator?: Validator<TSchema, TInputSchema>
  methods?: TMethods
  relations?: TDefinitions
  syncDestinations?: SyncKey[]
}) {
  type ModelSchema = EntitySchema<TInputSchema>

  const {
    schema,
    relations = {},
    syncDestinations = [],
    methods = {},
    validator = (schema: TSchema, data: unknown) => data as TInputSchema,
  } = configObj

  // TODO: The user should define the schema without any dynamically added ID
  validateInput(schema as unknown as ModelSchema, methods, relations)

  const relationAccessor =
    Object.keys(relations).length > 0 ? relationAccessorFactory(relations) : {}

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
      TDefinitions
    >
  }

  function recoverEntity(serializedData: string) {
    const data = JSON.parse(serializedData) as ModelSchema
    const internalEntity = new internalEntityClass(data)

    const proxyTarget = createProxyTarget(internalEntity)

    return new Proxy(proxyTarget, proxyHandler) as unknown as Entity<
      ModelSchema,
      TMethods,
      TDefinitions
    >
  }

  return {
    createEntity,
    recoverEntity,
  }
}

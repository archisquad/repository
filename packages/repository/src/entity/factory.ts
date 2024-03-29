import type { PartialDeep } from "type-fest"
import { generateId } from "./generateId"
import { getIdentifier } from "./identifier"
import type {
  Entity,
  EntityPrototype,
  EntitySchema,
  Identifier,
  Methods,
  ProxyTarget,
  RelationshipsDefinitions,
  UpdateEntityInput,
  Validator,
} from "./interface"
import { internalEntityFactory } from "./internalEntityFactory"
import { proxyHandlerFactory } from "./proxyHandlerFactory"
import { relationAccessorFactory } from "./relationsAccessor"
import { validateConfigObj } from "./validation"

export function entityModelFactory<
  TSchema,
  TInputSchema extends EntitySchema,
  TIdentifier extends Identifier<TInputSchema> | undefined,
  TMethods extends Methods<TInputSchema> | undefined,
  const TRelations extends RelationshipsDefinitions<TInputSchema>,
>(configObj: {
  schema: TSchema
  inferSchema: (data: TSchema) => TInputSchema
  identifier?: TIdentifier
  validator?: Validator<TSchema, TInputSchema>
  methods?: TMethods
  relations?: TRelations
}) {
  const {
    schema,
    identifier,
    relations = {},
    methods = {},
    validator = (_schema: TSchema, data: unknown) => data as TInputSchema,
  } = configObj

  validateConfigObj(configObj)

  const identifierFn = getIdentifier<TInputSchema, TIdentifier>(identifier)
  const validatorFn = (data: unknown) => validator(schema, data)
  const internalEntityClass = internalEntityFactory<TInputSchema, TIdentifier>(
    validatorFn,
    identifierFn
  )

  const relationAccessor =
    Object.keys(relations).length > 0 ? relationAccessorFactory(relations) : {}

  const proxyHandler = proxyHandlerFactory<ProxyTarget>(updateEntity, methods)

  function updateEntity(
    this: { internalEntity: EntityPrototype<TInputSchema, TIdentifier> },
    updatedData: PartialDeep<UpdateEntityInput<TInputSchema, TIdentifier>>
  ): any {
    const updatedInternalEntity = this.internalEntity.update(updatedData)

    const proxyTarget = proxyTargetFactory(updatedInternalEntity)

    return new Proxy(proxyTarget, proxyHandler)
  }

  function proxyTargetFactory<TInternalEntity>(
    internalEntity: TInternalEntity
  ) {
    return {
      internalEntity,
      relationAccessor,
    }
  }

  function createProxy(data: TInputSchema) {
    const internalEntity = new internalEntityClass(data)

    const proxyTarget = proxyTargetFactory(internalEntity)

    return new Proxy(proxyTarget, proxyHandler) as unknown as Entity<
      TInputSchema,
      TMethods,
      TRelations,
      TIdentifier
    >
  }

  function createEntity<TInputData extends TInputSchema>(
    inputData: TInputData
  ) {
    let data = inputData
    if (!identifier) {
      data = { ...inputData, id: generateId() }
    }
    const proxy = createProxy(data)

    return proxy
  }

  function recoverEntity(serializedData: string) {
    const data = JSON.parse(serializedData) as TInputSchema
    const proxy = createProxy(data)

    return proxy
  }

  return {
    createEntity,
    recoverEntity,
  }
}

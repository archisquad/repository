import type { EntitySchema, Identifier, Methods, Validator } from "./interface"
import type { RelationshipsDefinitions } from "./interface/relations"

export function validateConfigObj<
  TSchema,
  TInputSchema extends EntitySchema,
  TIdentifier extends Identifier<TInputSchema> | undefined,
  TMethods extends Methods<TInputSchema> | undefined,
  const TDefinitions extends RelationshipsDefinitions<TInputSchema>,
>(configObj: {
  schema: TSchema
  inferSchema: (data: TSchema) => TInputSchema
  identifier?: TIdentifier
  validator?: Validator<TSchema, TInputSchema>
  methods?: TMethods
  relations?: TDefinitions
}): void {
  const { inferSchema, methods = {}, relations = {}, identifier } = configObj
  const schema = inferSchema(configObj.schema)

  const fieldNames = Object.keys(schema)
  const methodNames = Object.keys(methods)
  const relationNames = Object.keys(relations)

  checkIsDefaultIdentifierDefined()
  checkIsDeclaredIdentifierDefined()

  if (isNoRelationsOrMethodsDefined()) {
    return
  }

  checkIsAnyRelationNameUsedInMethods()
  checkIsAnyFieldNameUsedInMethods()
  checkIsAnyFieldNameUsedInRelations()

  function checkIsDefaultIdentifierDefined() {
    if (!identifier && !fieldNames.includes("id")) {
      throw new EntityModelValidationError(
        "You must provide an identifier or define a field named 'id'."
      )
    }
  }

  function checkIsDeclaredIdentifierDefined() {
    if (
      identifier &&
      typeof identifier === "string" &&
      !fieldNames.includes(identifier)
    ) {
      throw new EntityModelValidationError(
        "The given identifier does not exist in the schema."
      )
    }
  }

  function isNoRelationsOrMethodsDefined() {
    return methodNames.length === 0 && relationNames.length === 0
  }

  function checkIsAnyRelationNameUsedInMethods() {
    if (relationNames.some((name) => methodNames.includes(name))) {
      throw new EntityModelValidationError(
        "Relations names cannot be the same as method names. Fix your relations names."
      )
    }
  }

  function checkIsAnyFieldNameUsedInMethods() {
    if (fieldNames.some((name) => methodNames.includes(name))) {
      throw new EntityModelValidationError(
        "Field names cannot be the same as method names. Fix your method or field names."
      )
    }
  }

  function checkIsAnyFieldNameUsedInRelations() {
    if (fieldNames.some((name) => relationNames.includes(name))) {
      throw new EntityModelValidationError(
        "Field names cannot be the same as relation names. Fix your field or relation names."
      )
    }
  }
}

class EntityModelValidationError extends Error {}

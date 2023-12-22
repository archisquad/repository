import {
  EntitySchema,
  Identifier,
  Methods,
  SyncKey,
  Validator,
} from "./interface"
import { RelationshipsDefinitions } from "./interface/relations"

export function validateInput<
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
  syncDestinations?: SyncKey[]
}): void {
  const { inferSchema, methods = {}, relations = {}, identifier } = configObj
  const schema = inferSchema(configObj.schema)

  const fieldNames = Object.keys(schema)
  const methodNames = Object.keys(methods)
  const relationNames = Object.keys(relations)

  if (isDefaultIdentifierDefined(identifier, fieldNames)) {
    throw new EntityModelValidationError(
      "You must provide an identifier or define a field named 'id'."
    )
  }

  if (isDeclaredIdentifierDefined(identifier, fieldNames)) {
    throw new EntityModelValidationError(
      "The given identifier does not exist in the schema."
    )
  }

  if (isNoRelationsOrMethodsDefined(methodNames, relationNames)) {
    return
  }

  if (isAnyRelationNameUsedInMethods(methodNames, relationNames)) {
    throw new EntityModelValidationError(
      "Relations names cannot be the same as method names. Fix your relations names."
    )
  }

  if (isAnyFieldNameUsedInMethods(methodNames, fieldNames)) {
    throw new EntityModelValidationError(
      "Field names cannot be the same as method names. Fix your method or field names."
    )
  }

  if (isAnyFieldNameUsedInRelations(relationNames, fieldNames)) {
    throw new EntityModelValidationError(
      "Field names cannot be the same as relation names. Fix your field or relation names."
    )
  }
}

class EntityModelValidationError extends Error {}

function isDefaultIdentifierDefined(identifier: unknown, fieldNames: string[]) {
  return !identifier && !fieldNames.includes("id")
}

function isDeclaredIdentifierDefined(
  identifier: unknown,
  fieldNames: string[]
) {
  return (
    identifier &&
    typeof identifier === "string" &&
    !fieldNames.includes(identifier)
  )
}

function isNoRelationsOrMethodsDefined(
  methodNames: string[],
  relationNames: string[]
) {
  return methodNames.length === 0 && relationNames.length === 0
}

function isAnyRelationNameUsedInMethods(
  methodNames: string[],
  relationNames: string[]
) {
  return relationNames.some((name) => methodNames.includes(name))
}

function isAnyFieldNameUsedInMethods(
  methodNames: string[],
  fieldNames: string[]
) {
  return fieldNames.some((name) => methodNames.includes(name))
}

function isAnyFieldNameUsedInRelations(
  relationNames: string[],
  fieldNames: string[]
) {
  return fieldNames.some((name) => relationNames.includes(name))
}

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

  checkIsDefaultIdentifierDefined(identifier, fieldNames)
  checkIsDeclaredIdentifierDefined(identifier, fieldNames)

  if (isNoRelationsOrMethodsDefined(methodNames, relationNames)) {
    return
  }

  checkIsAnyRelationNameUsedInMethods(methodNames, relationNames)
  checkIsAnyFieldNameUsedInMethods(methodNames, fieldNames)
  checkIsAnyFieldNameUsedInRelations(relationNames, fieldNames)
}

class EntityModelValidationError extends Error {}

function checkIsDefaultIdentifierDefined(
  identifier: unknown,
  fieldNames: string[]
) {
  if (!identifier && !fieldNames.includes("id")) {
    throw new EntityModelValidationError(
      "You must provide an identifier or define a field named 'id'."
    )
  }
}

function checkIsDeclaredIdentifierDefined(
  identifier: unknown,
  fieldNames: string[]
) {
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

function isNoRelationsOrMethodsDefined(
  methodNames: string[],
  relationNames: string[]
) {
  return methodNames.length === 0 && relationNames.length === 0
}

function checkIsAnyRelationNameUsedInMethods(
  methodNames: string[],
  relationNames: string[]
) {
  if (relationNames.some((name) => methodNames.includes(name))) {
    throw new EntityModelValidationError(
      "Relations names cannot be the same as method names. Fix your relations names."
    )
  }
}

function checkIsAnyFieldNameUsedInMethods(
  methodNames: string[],
  fieldNames: string[]
) {
  if (fieldNames.some((name) => methodNames.includes(name))) {
    throw new EntityModelValidationError(
      "Field names cannot be the same as method names. Fix your method or field names."
    )
  }
}

function checkIsAnyFieldNameUsedInRelations(
  relationNames: string[],
  fieldNames: string[]
) {
  if (fieldNames.some((name) => relationNames.includes(name))) {
    throw new EntityModelValidationError(
      "Field names cannot be the same as relation names. Fix your field or relation names."
    )
  }
}

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
  // TODO: Verify if this is the best way to handle identifier (especially at type-level)
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

  if (!identifier && !fieldNames.includes("id")) {
    throw new EntityModelValidationError(
      "You must provide an identifier or define a field named 'id'."
    )
  }

  if (
    identifier &&
    typeof identifier === "string" &&
    !fieldNames.includes(identifier)
  ) {
    throw new EntityModelValidationError(
      `The identifier '${identifier}' does not exist in the schema.`
    )
  }

  if (methodNames.length === 0 && relationNames.length === 0) {
    return
  }

  if (relationNames.some((name) => methodNames.includes(name))) {
    throw new EntityModelValidationError(
      "Relations names cannot be the same as method names. Fix your relations names."
    )
  }

  if (fieldNames.some((name) => methodNames.includes(name))) {
    throw new EntityModelValidationError(
      "Field names cannot be the same as method names. Fix your method or field names."
    )
  }

  if (fieldNames.some((name) => relationNames.includes(name))) {
    throw new EntityModelValidationError(
      "Field names cannot be the same as relation names. Fix your field or relation names."
    )
  }
}

class EntityModelValidationError extends Error {}

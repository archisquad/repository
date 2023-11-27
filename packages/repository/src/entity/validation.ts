import { EntitySchema, Methods } from "./interface"
import { RelationshipsDefinitions } from "./interface/relations"

export function validateInput<
  TSchema extends EntitySchema,
  TMethods extends Methods<TSchema>,
>(
  schema: TSchema,
  methods: TMethods,
  relations: RelationshipsDefinitions<TSchema>
): void {
  const fieldNames = Object.keys(schema)
  const methodNames = Object.keys(methods)
  const relationNames = Object.keys(relations)

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

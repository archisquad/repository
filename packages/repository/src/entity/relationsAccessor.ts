import type {
  EntitySchema,
  RelationshipsDefinitions,
  ResolvedRelations,
} from "./interface"

export function relationAccessorFactory<
  TSchema extends EntitySchema,
  const TDefinitions extends RelationshipsDefinitions<TSchema>,
>(definitions: TDefinitions) {
  if (Object.keys(definitions).length === 0) {
    throw new Error("Relation definitions array cannot be empty")
  }

  return Object.entries(definitions).reduce(
    (accessor, [name, _definition]) => {
      accessor[name] = () => {
        // TODO: Add implementation for reaching out to RepositoryManager

        return {}
      }
      return accessor
    },
    {} as Record<string, any>
  ) as ResolvedRelations<TSchema, TDefinitions>
}

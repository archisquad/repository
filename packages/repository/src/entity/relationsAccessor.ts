/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Relations, Relationship } from "./interface"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function relationAccessorFactory<const TDefinitionsUnion>(
  definitions: readonly TDefinitionsUnion[]
) {
  if (definitions.length === 0) {
    throw new Error("Relation definitions array cannot be empty")
  }

  type Definitions = (typeof definitions)[number]

  return definitions.reduce(
    (accessor, definition: TDefinitionsUnion) => {
      isDefinition(definition)
      accessor[definition.id] = () => {
        // TODO: Add implementation for reaching out to RepositoryManager

        return {}
      }
      return accessor
    },
    {} as Record<string, any>
  ) as Relations<Definitions>
}

function isDefinition(
  x: unknown
): asserts x is Relationship<Record<string, any>> {
  return
}

import {
  FindForeignSchemaInDefinitions,
  ForeignType,
  Relations,
} from "./relations"
import {
  AuthorRelationDefinition,
  PostsRelationDefinition,
  describe,
  expectTypeOf,
  it,
} from "vitest"

describe("Interface: Relations", () => {
  it("FindForeignSchemaInDefinitions finds foreign schema from union of definitions", () => {
    type Definitions = PostsRelationDefinition | AuthorRelationDefinition

    type Test = FindForeignSchemaInDefinitions<Definitions, "posts">

    expectTypeOf<Test>().toEqualTypeOf<{
      id: string
      name: string
      authorId: string
    }>()
  })

  it("ForeignType return proper foreign schema according to relationship type", () => {
    type Definitions = PostsRelationDefinition | AuthorRelationDefinition

    type Test = ForeignType<Definitions, "posts", "has-many">

    expectTypeOf<Test>().toEqualTypeOf<
      {
        id: string
        name: string
        authorId: string
      }[]
    >()
  })

  it("Relations is helper to create a map of relation names to function that returns foreign schema", () => {
    type Definitions = PostsRelationDefinition | AuthorRelationDefinition

    type Test = Relations<Definitions>

    expectTypeOf<Test>().toEqualTypeOf<
      {
        posts: () => {
          id: string
          name: string
          authorId: string
        }[]
      } & {
        author: () => {
          id: string
          name: string
        }
      }
    >()
  })
})

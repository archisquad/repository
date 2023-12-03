import { RelationshipsDefinitions, ResolvedRelations } from "./relations"
import { RepositoryKey } from "@/repositoryKey"
import {
  AuthorRelationDefinition,
  PostsRelationDefinition,
  TestEntityData,
  describe,
  expectTypeOf,
  it,
} from "vitest"

describe("Interface: Relations", () => {
  it("uses defined relationship names as accessor function names", () => {
    type Test = ResolvedRelations<
      TestEntityData,
      {
        posts: PostsRelationDefinition
        author: AuthorRelationDefinition
      }
    >

    expectTypeOf<keyof Test>().toEqualTypeOf<"posts" | "author">()
  })

  it("creates map with functions that return foreign schema", () => {
    type Test = ResolvedRelations<
      TestEntityData,
      {
        posts: PostsRelationDefinition
        author: AuthorRelationDefinition
      }
    >

    expectTypeOf<Test>().toEqualTypeOf<{
      posts: () => {
        id: string
        name: string
        authorId: string
      }[]
      author: () => {
        id: string
        name: string
      }
    }>()
  })

  it("creates a function that return foreign schema when relation type is belongs-to", () => {
    type Test = ResolvedRelations<
      TestEntityData,
      {
        author: AuthorRelationDefinition
      }
    >

    expectTypeOf<Test["author"]>().toEqualTypeOf<
      () => {
        id: string
        name: string
      }
    >()
  })

  it("creates a function that return array of foreign schema when relation type is has-many", () => {
    type Test = ResolvedRelations<
      TestEntityData,
      {
        posts: PostsRelationDefinition
      }
    >

    expectTypeOf<Test["posts"]>().toEqualTypeOf<
      () => {
        id: string
        name: string
        authorId: string
      }[]
    >()
  })

  it("returns empty object when no relations are defined", () => {
    type Test = ResolvedRelations<TestEntityData, undefined>

    expectTypeOf<Test>().toEqualTypeOf<{}>()
  })

  it("return empty object when union generic with undefined is passed", () => {
    type Test = ResolvedRelations<
      TestEntityData,
      RelationshipsDefinitions<TestEntityData> | undefined
    >

    expectTypeOf<Test>().toEqualTypeOf<{}>()
  })

  it("forces to use schema keys as local keys in relationship", () => {
    type Test = ResolvedRelations<
      TestEntityData,
      // @ts-expect-error -- local key is not a key of the schema
      {
        posts: {
          type: "has-many"
          foreignRepository: RepositoryKey<
            {
              id: string
              name: string
              authorId: string
            },
            "posts"
          >
          foreignKey: "authorId"
          localKey: "bleh"
        }
      }
    >

    expectTypeOf<Test>().toMatchTypeOf<{}>()
  })
})

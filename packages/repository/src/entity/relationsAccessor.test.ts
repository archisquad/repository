import { makeRepositoryKey } from "@/repositoryKey"
import {
  TestEntityData,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
} from "vitest"
/* eslint-disable @typescript-eslint/no-empty-function */
import { ResolvedRelations } from "./interface"
import { relationAccessorFactory } from "./relationsAccessor"

describe("Entity: Relations Accessor", () => {
  beforeEach((context) => {
    context.postsRepositoryKey = makeRepositoryKey<
      {
        id: string
        name: string
        authorId: string
      },
      "posts"
    >("posts")
    context.authorsRepositoryKey = makeRepositoryKey<
      {
        id: string
        name: string
      },
      "authors"
    >("authors")
  })

  it("Given relations array, When factory called, Then return object with relation names & accessor functions", ({
    authorsRepositoryKey,
    postsRepositoryKey,
  }) => {
    const relations = {
      author: {
        type: "belongs-to",
        foreignRepository: authorsRepositoryKey,
        foreignKey: "id",
        localKey: "bar",
      },
      posts: {
        type: "has-many",
        foreignRepository: postsRepositoryKey,
        foreignKey: "id",
        localKey: "foo",
      },
    } as const

    const relationsAccessor = relationAccessorFactory<
      TestEntityData,
      typeof relations
    >(relations)

    expectTypeOf(relationsAccessor).toEqualTypeOf<
      ResolvedRelations<TestEntityData, typeof relations>
    >()
    expectTypeOf(relationsAccessor.author).toEqualTypeOf<
      () => {
        id: string
        name: string
      }
    >()
    expectTypeOf(relationsAccessor.posts).toEqualTypeOf<
      () => {
        id: string
        name: string
        authorId: string
      }[]
    >()
    expect(Object.keys(relationsAccessor)).toEqual(["author", "posts"])
  })

  it("Given an empty array, When factory called, Then throw an error", () => {
    expect(() => relationAccessorFactory({})).toThrow()
  })
})

/* eslint-disable @typescript-eslint/no-empty-function */
import { Relations } from "./interface"
import { relationAccessorFactory } from "./relationsAccessor"
import { makeRepositoryKey } from "@/repositoryKey"
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest"

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
    const relations = [
      {
        id: "author",
        type: "belongs-to",
        foreignRepository: authorsRepositoryKey,
        foreignKey: "id",
        localKey: "bar",
      } as const,
      {
        id: "posts",
        type: "has-many",
        foreignRepository: postsRepositoryKey,
        foreignKey: "id",
        localKey: "foo",
      } as const,
    ]

    const relationsAccessor = relationAccessorFactory(relations)

    expectTypeOf(relationsAccessor).toEqualTypeOf<
      Relations<(typeof relations)[number]>
    >
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
    expect(() => relationAccessorFactory([])).toThrow()
  })

  it.todo(
    "Given a relation definition, When belongs-to accessor called, Then return one related entity",
    () => {}
  )

  it.todo(
    "Given a relation definition, When has-many accessor called, Then return many related entities",
    () => {}
  )
})

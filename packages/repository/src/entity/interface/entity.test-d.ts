import type { PostsRelationDefinition, TestEntityData } from "vitest"
import { describe, expectTypeOf, it } from "vitest"
import type { Entity } from "./entity"

describe("Entity interface", () => {
  it("Entity has relationship accessors according to defined relations", () => {
    type Test = Entity<
      TestEntityData,
      undefined,
      { posts: PostsRelationDefinition }
    >

    expectTypeOf<Test["posts"]>().toEqualTypeOf<
      () => {
        id: string
        name: string
        authorId: string
      }[]
    >()
  })

  it("Entity can be created without relations", () => {
    type Test = Entity<TestEntityData>

    expectTypeOf<Test["id"]>().toEqualTypeOf<string>()
    expectTypeOf<Test["foo"]>().toEqualTypeOf<TestEntityData["foo"]>()
    expectTypeOf<Test["deep"]>().toMatchTypeOf<
      Readonly<TestEntityData["deep"]>
    >()
  })

  it("Entity has update method", () => {
    type EntityExample = Entity<TestEntityData>

    // TODO: Add type for narrowing if identifier is key-based
    expectTypeOf<EntityExample["update"]>().toMatchTypeOf<
      (data: TestEntityData) => EntityExample
    >()
  })

  it("Entity has toObject method", () => {
    type Test = Entity<TestEntityData>

    expectTypeOf<Test["toObject"]>().toEqualTypeOf<() => TestEntityData>()
  })

  it("Entity has getIdentifier method", () => {
    type Test = Entity<TestEntityData, undefined, undefined, () => number>

    expectTypeOf<Test["getIdentifier"]>().toEqualTypeOf<() => number>()
  })

  it("Entity could have identifier defined", () => {
    type Test = Entity<TestEntityData, undefined, undefined, "bar">

    expectTypeOf<Test["getIdentifier"]>().toEqualTypeOf<() => number>()
  })

  it("Entity haven't to identifier defined", () => {
    type Test = Entity<TestEntityData, undefined, undefined, undefined>

    expectTypeOf<Test["getIdentifier"]>().toEqualTypeOf<() => string>()
  })

  it("Entity give readonly access to data", () => {
    type Test = Entity<TestEntityData>

    expectTypeOf<Test["foo"]>().toMatchTypeOf<Readonly<TestEntityData["foo"]>>()
    expectTypeOf<Test["bar"]>().toMatchTypeOf<Readonly<TestEntityData["bar"]>>()
    expectTypeOf<Test["deep"]>().toMatchTypeOf<
      Readonly<TestEntityData["deep"]>
    >()
  })

  it("Entity allow to define custom methods", () => {
    type Test = Entity<
      TestEntityData,
      {
        customMethod(): string
      }
    >

    expectTypeOf<Test["customMethod"]>().toEqualTypeOf<() => string>()
  })

  it("Entity can be created without defining methods", () => {
    type Test = Entity<TestEntityData>

    expectTypeOf<Test>().toMatchTypeOf<
      TestEntityData & {
        id: string
      }
    >()
  })

  it("Defined methods can't override built-in update method", () => {
    type Test = Entity<
      TestEntityData,
      {
        update(): never
      }
    >

    expectTypeOf<Test["update"]>().toMatchTypeOf<
      (
        data: TestEntityData
      ) => Entity<TestEntityData, { update(): never }, undefined, undefined>
    >()
  })

  it("Defined methods can override other built-in methods", () => {
    type Test = Entity<
      TestEntityData,
      {
        toJson(): { foo: string }
      }
    >

    expectTypeOf<Test["toJson"]>().toEqualTypeOf<() => { foo: string }>()
  })

  it("Defined method can access data via this", () => {
    type Test = Entity<
      TestEntityData,
      {
        customMethod(): string
      }
    >

    expectTypeOf<Test["customMethod"]>().toEqualTypeOf<
      (this: TestEntityData) => string
    >()
  })
})

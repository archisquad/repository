import { AllowedEntityInput, EntitySchema } from "./data"
import { Entity } from "./entity"
import {
  PostsRelationDefinition,
  TestEntityData,
  describe,
  expectTypeOf,
  it,
} from "vitest"

describe("Entity interface", () => {
  it("Entity has relationship accessors according to defined relations", () => {
    type Test = Entity<TestEntityData, undefined, [PostsRelationDefinition]>

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
    expectTypeOf<Test["deep"]>().toEqualTypeOf<
      Readonly<TestEntityData["deep"]>
    >()
  })

  it("Entity has update method", () => {
    type EntityExample = Entity<TestEntityData>

    expectTypeOf<EntityExample["update"]>().toMatchTypeOf<
      (data: AllowedEntityInput<TestEntityData>) => EntityExample
    >()
  })

  it("Entity has toObject method", () => {
    type Test = Entity<TestEntityData>

    expectTypeOf<Test["toObject"]>().toEqualTypeOf<() => TestEntityData>()
  })

  it("Entity give readonly access to data", () => {
    type Test = Entity<TestEntityData>

    expectTypeOf<Test["foo"]>().toEqualTypeOf<Readonly<TestEntityData["foo"]>>()
    expectTypeOf<Test["bar"]>().toEqualTypeOf<Readonly<TestEntityData["bar"]>>()
    expectTypeOf<Test["deep"]>().toEqualTypeOf<
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

    expectTypeOf<Test["update"]>().toEqualTypeOf<{
      (
        data: AllowedEntityInput<TestEntityData>
      ): Entity<TestEntityData, { update(): never }, []>
    }>()
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

describe("EntitySchema", () => {
  it("should omit id from input", () => {
    type Test = EntitySchema<{ id: number; name: string }>

    expectTypeOf<Test>().toMatchTypeOf<{ name: string }>()
    expectTypeOf<Test>().not.toMatchTypeOf<{ id: number }>()
  })

  it("should add id to output", () => {
    type Test = EntitySchema<{ name: string }>

    expectTypeOf<Test>().toMatchTypeOf<{ id: string; name: string }>()
  })
})

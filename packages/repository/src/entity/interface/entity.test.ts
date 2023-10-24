import { AllowedEntityInput } from "./data"
import { Entity } from "./entity"
import {
  PostsRelationDefinition,
  TestEntityData,
  describe,
  expectTypeOf,
  it,
} from "vitest"

describe("interface", () => {
  it("Entity has relationship accessors according to defined relations", () => {
    type Test = Entity<TestEntityData, [PostsRelationDefinition]>

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
    type Test = EntityExample["update"]

    expectTypeOf<Test>().toMatchTypeOf<
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
})

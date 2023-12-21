import { TestEntityData, describe, expectTypeOf, it } from "vitest"
import { ResolveIdentifier } from "./data"

describe("User Input Data types", () => {
  it("ResolveIdentifier returns default identifier if identifier is undefined", () => {
    type Test = ResolveIdentifier<TestEntityData, undefined>

    expectTypeOf<Test>().toEqualTypeOf<string>()
  })

  it("ResolveIdentifier returns ReturnType if identifier is function", () => {
    type Test = ResolveIdentifier<
      TestEntityData,
      (data: TestEntityData) => number
    >

    expectTypeOf<Test>().toEqualTypeOf<number>()
  })

  it("ResolveIdentifier returns TSchema[Identifier] if identifier is keyof TSchema", () => {
    type Test = ResolveIdentifier<TestEntityData, "foo">

    expectTypeOf<Test>().toEqualTypeOf<string>()
  })
})

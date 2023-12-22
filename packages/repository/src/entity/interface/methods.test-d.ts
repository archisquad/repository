import type { TestEntityData } from "vitest"
import { describe, expectTypeOf, it } from "vitest"
import type { PrototypeMethods, ResolvedMethods } from "./methods"

describe("Method-definition types", () => {
  it("ResolvedMethods returns prototype methods if methods are undefined", () => {
    type Test = ResolvedMethods<TestEntityData, undefined>

    expectTypeOf<Test>().toEqualTypeOf<PrototypeMethods<TestEntityData>>()
  })

  it("ResolvedMethods returns prototype methods & those defined", () => {
    type Test = ResolvedMethods<
      TestEntityData,
      { testMethod: (data: TestEntityData) => number }
    >

    expectTypeOf<Test>().toEqualTypeOf<
      PrototypeMethods<TestEntityData> & {
        testMethod: (data: TestEntityData) => number
      }
    >()
  })

  it("ResolvedMethods handles overriding prototype methods by user-defined methods", () => {
    type Test = ResolvedMethods<
      TestEntityData,
      { toJson: () => { id: string } }
    >

    expectTypeOf<Test["toJson"]>().toEqualTypeOf<() => { id: string }>()
  })

  it("ResolvedMethods blocks overriding update() & getIdentifier()", () => {
    type Test = ResolvedMethods<
      TestEntityData,
      { update: () => void; getIdentifier: () => void }
    >

    expectTypeOf<keyof Test>().toMatchTypeOf<
      "toJson" | "toObject" | "isSynced" | "setSynced"
    >()
  })
})

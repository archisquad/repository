import { AllowedEntityInput, EntitySchema } from "./data"
import { describe, expectTypeOf, it } from "vitest"

describe("User Input Data types", () => {
  it("UserInputData is id-stripped, partial schema", () => {
    type Test = AllowedEntityInput<EntitySchema<{ foo: string; id: number }>>

    expectTypeOf<Test>().not.toEqualTypeOf<{ id: number }>()
    expectTypeOf<Test["foo"]>().toEqualTypeOf<string | undefined>()
  })
})

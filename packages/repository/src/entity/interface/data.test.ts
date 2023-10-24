import { AllowedEntityInput, EntitySchema } from "./data"
import { describe, expectTypeOf, it } from "vitest"

describe("User Input Data types", () => {
  it("UserInputData is id-stripped, partial schema", () => {
    type Test = AllowedEntityInput<EntitySchema<{ foo: string; id: number }>>

    // @ts-expect-error -- testing types
    expectTypeOf<Test["id"]>().toEqualTypeOf<never>()
    expectTypeOf<Test["foo"]>().toEqualTypeOf<string | undefined>()
  })
})

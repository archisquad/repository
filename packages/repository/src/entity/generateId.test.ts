import { describe, expect, expectTypeOf, it } from "vitest"
import { generateId } from "./generateId"

describe("generateId", () => {
  it("Given generateId function, When called, Then return string", () => {
    const result = generateId()

    expect(result).not.toBeUndefined()
    expectTypeOf(result).toEqualTypeOf<string>()
  })
})

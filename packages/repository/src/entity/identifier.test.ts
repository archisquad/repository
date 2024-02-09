import { describe, expect, it } from "vitest"
import { getIdentifier } from "./identifier"

describe("getIdentifier", () => {
  it("Given getIdentifier function with no identifier, When called, Then return function that gets the id field", ({
    fakeData,
  }) => {
    const getID = getIdentifier<typeof fakeData, undefined>()

    expect(getID(fakeData)).toBe(fakeData.id)
  })

  it("Given getIdentifier function with string identifier, When called, Then return function that gets the specified field", ({
    fakeData,
  }) => {
    fakeData.foo = "foo"
    const getId = getIdentifier<typeof fakeData, "foo">("foo")

    expect(getId(fakeData)).toBe("foo")
  })

  it("Given getIdentifier function with function identifier, When called, Then return the provided function", ({
    fakeData,
  }) => {
    const getID = getIdentifier<
      typeof fakeData,
      (data: typeof fakeData) => string
    >(() => "randomId")

    expect(getID(fakeData)).toBe("randomId")
  })
})

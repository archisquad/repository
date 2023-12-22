import {
  TestContext,
  TestEntityData,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from "vitest"
import { internalEntityFactory } from "./proto"
import { DeepReadonly } from "./types"

describe("proto", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createSut(
    context: TestContext,
    overrides?: {
      validatorFn?: (...args: any[]) => any
      identifierFn?: (...args: any[]) => any
    }
  ) {
    const { passThroughValidator, syncKeys, fakeData } = context
    const { validatorFn = passThroughValidator, identifierFn = () => "1" } =
      overrides ?? {}

    const sut = internalEntityFactory<TestEntityData, "id">(
      syncKeys,
      validatorFn,
      identifierFn
    )

    return {
      sut,
      inputData: fakeData,
      syncKeys,
    }
  }

  it("Update method returns new instance with extended data", (context) => {
    const { sut, inputData } = createSut(context)
    const entity = new sut({ ...inputData, id: "1" })

    const result = entity.update({
      foo: "foo2",
      bar: 2,
      some: true,
    })

    expect(result).not.toBe(entity)
    expect(result.toObject()).toEqual(
      expect.objectContaining({
        id: "1",
        foo: "foo2",
        some: true,
      })
    )
    expectTypeOf(result.toObject()).toMatchTypeOf<
      DeepReadonly<{
        id: string
        foo: string
        bar: number
        deep?: {
          foo: string
          bar: string
        }
        some: boolean
      }>
    >()
  })

  it("isSynced method return status for given SyncKey", (context) => {
    const { sut, inputData, syncKeys } = createSut(context)

    const entity = new sut({ ...inputData, id: "2" })

    expect(entity.isSynced(syncKeys[0])).toBe(false)
    expect(entity.isSynced(syncKeys[1])).toBe(false)
  })

  it("setSynced method set status for given SyncKey", async (context) => {
    const { sut, inputData, syncKeys } = createSut(context)
    const entity = new sut({ ...inputData, id: "1" })
    const promise = Promise.resolve()

    entity.setSynced(syncKeys[0], promise)
    await promise

    expect(entity.isSynced(syncKeys[0])).toBe(true)
    expect(entity.isSynced(syncKeys[1])).toBe(false)
  })

  it("getIdentifier method returns identifier value", (context) => {
    const { sut, inputData } = createSut(context)
    const entity = new sut({ ...inputData, id: "1" })

    expect(entity.getIdentifier()).toBe("1")
  })

  it("Validator function is called on entity creation", (context) => {
    const validatorFn = vi.fn(<TInput>(input: TInput) => ({
      ...context.passThroughValidator(input),
      bar: "bar",
    }))
    const { sut, inputData } = createSut(context, { validatorFn })

    const result = new sut({ ...inputData, id: "1" })

    expect(validatorFn).toBeCalledTimes(1)
    expect(result.data.bar).toBe("bar")
  })

  it("Validator function is called on entity update", (context) => {
    const validatorFn = vi.fn(<TInput>(input: TInput) => ({
      ...context.passThroughValidator(input),
      foo: "updated",
    }))
    const { sut, inputData } = createSut(context, { validatorFn })
    const entity = new sut({ ...inputData, id: "1" })

    entity.update({ foo: "foo2", bar: 2, some: true })

    expect(validatorFn).toBeCalledTimes(2)
    expect(entity.data.foo).toBe("updated")
  })

  it("toObject should return a copy of data", (context) => {
    const { sut, inputData } = createSut(context)
    const entity = new sut({ ...inputData, id: "1" })

    const result = entity.toObject()

    expect(result).not.toBe(entity.data)
    expect(result).toEqual(entity.data)
  })
})

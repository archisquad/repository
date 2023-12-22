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
import type { DeepReadonly } from "./deepReadonly"
import type { PartialDeep } from "type-fest"

describe("proto", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createSut(
    context: TestContext,
    overrides?: {
      inputData?: PartialDeep<TestEntityData>
      validatorFn?: (...args: any[]) => any
      identifierFn?: (...args: any[]) => any
    }
  ) {
    const { passThroughValidator, syncKeys, fakeData } = context
    const {
      validatorFn = passThroughValidator,
      identifierFn = () => "1",
      inputData = {},
    } = overrides ?? {}

    const sutFactory = internalEntityFactory<TestEntityData, "id">(
      syncKeys,
      validatorFn,
      identifierFn
    )

    const sut = new sutFactory({ ...fakeData, ...inputData } as TestEntityData)

    return {
      sut,
      syncKeys,
    }
  }

  it("Update method returns new instance with extended data", (context) => {
    const { sut } = createSut(context)

    const result = sut.update({
      foo: "foo2",
      bar: 2,
      some: true,
    })

    expect(result).not.toBe(sut)
    expect(result.data).toEqual(
      expect.objectContaining({
        foo: "foo2",
        bar: 2,
        some: true,
      })
    )
    expectTypeOf(result.data).toMatchTypeOf<
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
    const { sut, syncKeys } = createSut(context)

    expect(sut.isSynced(syncKeys[0])).toBe(false)
    expect(sut.isSynced(syncKeys[1])).toBe(false)
  })

  it("setSynced method set status for given SyncKey", async (context) => {
    const { sut, syncKeys } = createSut(context)
    const promise = Promise.resolve()

    sut.setSynced(syncKeys[0], promise)
    await promise

    expect(sut.isSynced(syncKeys[0])).toBe(true)
    expect(sut.isSynced(syncKeys[1])).toBe(false)
  })

  it("getIdentifier method returns identifier value", (context) => {
    const { sut } = createSut(context)

    expect(sut.getIdentifier()).toBe("1")
  })

  it("Validator function is called on entity creation", (context) => {
    const validatorFn = vi.fn(<TInput>(input: TInput) => ({
      ...context.passThroughValidator(input),
      bar: "bar",
    }))
    const { sut } = createSut(context, { validatorFn })

    expect(validatorFn).toBeCalledTimes(1)
    expect(sut.data.bar).toBe("bar")
  })

  it("Validator function is called on entity update", (context) => {
    const validatorFn = vi.fn(<TInput>(input: TInput) => ({
      ...context.passThroughValidator(input),
      foo: "updated",
    }))
    const { sut } = createSut(context, { validatorFn })

    sut.update({ foo: "foo2", bar: 2, some: true })

    expect(validatorFn).toBeCalledTimes(2)
    expect(sut.data.foo).toBe("updated")
  })

  it("toObject should return a copy of data", (context) => {
    const { sut } = createSut(context)

    const result = sut.toObject()

    expect(result).not.toBe(sut.data)
    expect(result).toEqual(sut.data)
  })
})

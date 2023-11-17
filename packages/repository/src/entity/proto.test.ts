import { createInternalEntity } from "./proto"
import { DeepReadonly } from "./types"
import {
  TestEntityData,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from "vitest"

describe("proto", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("Update method returns new instance with extended data", ({
    syncKeys,
    fakeData,
    passThroughValidator,
  }) => {
    const context = createInternalEntity<TestEntityData>(
      syncKeys,
      passThroughValidator
    )

    const entity = new context({ ...fakeData, id: "1" })

    const result = entity.update({
      foo: "foo2",
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
        deep: {
          foo: string
          bar: string
        }
        some: boolean
      }>
    >()
  })

  it("isSynced method return status for given SyncKey", ({
    syncKeys,
    fakeData,
    passThroughValidator,
  }) => {
    const context = createInternalEntity<TestEntityData>(
      syncKeys,
      passThroughValidator
    )

    const entity = new context({ ...fakeData, id: "2" })

    expect(entity.isSynced(syncKeys[0])).toBe(false)
    expect(entity.isSynced(syncKeys[1])).toBe(false)
  })

  it("setSynced method set status for given SyncKey", async ({
    syncKeys,
    fakeData,
    passThroughValidator,
  }) => {
    const context = createInternalEntity<TestEntityData>(
      syncKeys,
      passThroughValidator
    )

    const entity = new context({ ...fakeData, id: "1" })

    const promise = Promise.resolve()

    entity.setSynced(syncKeys[0], promise)
    await promise

    expect(entity.isSynced(syncKeys[0])).toBe(true)
    expect(entity.isSynced(syncKeys[1])).toBe(false)
  })

  it("Validator function is called on entity creation", ({
    syncKeys,
    fakeData,
    passThroughValidator,
  }) => {
    const validatorFn = vi.fn(<TInput>(input: TInput) => ({
      ...passThroughValidator(input),
      bar: "bar",
    }))
    const context = createInternalEntity<TestEntityData>(syncKeys, validatorFn)

    const result = new context({ ...fakeData, id: "1" })

    expect(validatorFn).toBeCalledTimes(1)
    expect(result.data.bar).toBe("bar")
  })

  it("Validator function is called on entity update", ({
    syncKeys,
    fakeData,
    passThroughValidator,
  }) => {
    const validatorFn = vi.fn(<TInput>(input: TInput) => ({
      ...passThroughValidator(input),
      foo: "updated",
    }))
    const context = createInternalEntity<TestEntityData>(syncKeys, validatorFn)
    const entity = new context({ ...fakeData, id: "1" })

    entity.update({ foo: "foo2" })

    expect(validatorFn).toBeCalledTimes(2)
    expect(entity.data.foo).toBe("updated")
  })
})

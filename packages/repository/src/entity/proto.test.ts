import { createInternalEntity } from "./proto"
import { DeepReadonly } from "./types"
import { TestEntityData, describe, expect, expectTypeOf, it } from "vitest"

describe("proto", () => {
  it("Update method returns new instance with extended data", ({
    syncKeys,
    fakeData,
  }) => {
    const context = createInternalEntity<TestEntityData>(syncKeys)

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
  }) => {
    const context = createInternalEntity<TestEntityData>(syncKeys)

    const entity = new context({ ...fakeData, id: "2" })

    expect(entity.isSynced(syncKeys[0])).toBe(false)
    expect(entity.isSynced(syncKeys[1])).toBe(false)
  })

  it("setSynced method set status for given SyncKey", async ({
    syncKeys,
    fakeData,
  }) => {
    const context = createInternalEntity<TestEntityData>(syncKeys)

    const entity = new context({ ...fakeData, id: "1" })

    const promise = Promise.resolve()

    entity.setSynced(syncKeys[0], promise)
    await promise

    expect(entity.isSynced(syncKeys[0])).toBe(true)
    expect(entity.isSynced(syncKeys[1])).toBe(false)
  })
})

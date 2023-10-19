import { createInternalEntity } from "./proto"
import { DeepReadonly } from "./types"
import { TestEntityData, describe, expect, expectTypeOf, it } from "vitest"

describe("proto", () => {
  it("Keep type of given input data", ({ syncKeys }) => {
    const context = createInternalEntity<TestEntityData>(syncKeys)

    const entity = new context({
      id: "1",
      foo: "foo",
      bar: 1,
    })

    const result = entity.toObject()
    expect(result).toEqual({
      foo: "foo",
      bar: 1,
      id: "1",
    })
    expectTypeOf(result).toEqualTypeOf<
      DeepReadonly<{ foo: string; bar: number; id: string }>
    >()
  })

  it("Update method returns new instance with extended data", ({
    syncKeys,
  }) => {
    const context = createInternalEntity<TestEntityData>(syncKeys)

    const entity = new context({
      id: "1",
      foo: "foo",
      bar: 1,
    })

    const result = entity.update({
      foo: "foo2",
      some: true,
    })

    expect(result).not.toBe(entity)
    expect(result.toObject()).toEqual({
      foo: "foo2",
      bar: 1,
      id: "1",
      some: true,
    })
    expectTypeOf(result.toObject()).toEqualTypeOf<
      DeepReadonly<
        {
          id: string
          foo: string
          bar: number
        } & {
          foo: string
          some: true
        }
      >
    >()
  })

  it("isSynced method return status for given SyncKey", ({ syncKeys }) => {
    const context = createInternalEntity<TestEntityData>(syncKeys)

    const entity = new context({
      id: "1",
      foo: "foo",
      bar: 1,
    })

    expect(entity.isSynced(syncKeys[0])).toBe(false)
    expect(entity.isSynced(syncKeys[1])).toBe(false)
  })

  it("setSynced method set status for given SyncKey", async ({ syncKeys }) => {
    const context = createInternalEntity<TestEntityData>(syncKeys)

    const entity = new context({
      id: "1",
      foo: "foo",
      bar: 1,
    })

    const promise = Promise.resolve()

    entity.setSynced(syncKeys[0], promise)
    await promise

    expect(entity.isSynced(syncKeys[0])).toBe(true)
    expect(entity.isSynced(syncKeys[1])).toBe(false)
  })
})

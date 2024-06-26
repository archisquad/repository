import { beforeEach, describe, expect, expectTypeOf, it } from "vitest"
import type { SyncKey } from "./interface/sync"
import { SyncMap, makeSyncKey } from "./sync"

declare module "vitest" {
  // biome-ignore lint/suspicious/noExportsInTest: this is only way to extend interface
  export interface TestContext {
    syncMapDestinationId: SyncKey
  }
}

describe("SyncMap", () => {
  beforeEach((context) => {
    context.syncMapDestinationId = makeSyncKey("destination-id")
  })

  describe("SyncKey", () => {
    it("Given string, When makeSyncKey is called, Then return SyncKey", () => {
      const syncKey = makeSyncKey("test")

      expect(syncKey).toBe("test")
      expectTypeOf(syncKey).toMatchTypeOf<SyncKey>()
    })
  })

  it("Given one destination ID, When SyncMap is created, Then status for the ID is false", ({
    syncMapDestinationId: destinationId,
  }) => {
    const syncMap = new SyncMap([destinationId])

    expect(syncMap.checkStatus(destinationId)).toBe(false)
  })

  it("Given two the same destination IDs, When SyncMap is created, Then status for the ID is false", ({
    syncMapDestinationId: destinationId,
  }) => {
    const syncMap = new SyncMap([destinationId, destinationId])

    expect(syncMap.checkStatus(destinationId)).toBe(false)
  })

  it("Given multiple destination IDs, When SyncMap is created, Then status for each ID is false", ({
    syncMapDestinationId: firstDestinationId,
  }) => {
    const secondDestinationId = makeSyncKey("other-destination-id")

    const syncMap = new SyncMap([firstDestinationId, secondDestinationId])

    expect(syncMap.checkStatus(firstDestinationId)).toBe(false)
    expect(syncMap.checkStatus(secondDestinationId)).toBe(false)
  })

  it("Given SyncMap with one destination & one unsettled promise, When set status & promise resolved, Then it is synced", async ({
    syncMapDestinationId: destinationId,
  }) => {
    const syncMap = new SyncMap([destinationId])
    expect(syncMap.checkStatus(destinationId)).toBe(false)
    const promise = new Promise((resolve) => {
      resolve(true)
    })

    syncMap.setStatus(destinationId, promise)
    expect(syncMap.checkStatus(destinationId)).toBe(false)

    await promise

    expect(syncMap.checkStatus(destinationId)).toBe(true)
  })

  it("Given SyncMap with one destination & one unsettled promise, When set status & promise rejects, Then it is not synced", async ({
    syncMapDestinationId: destinationId,
  }) => {
    const syncMap = new SyncMap([destinationId])
    expect(syncMap.checkStatus(destinationId)).toBe(false)
    const promise = new Promise((_resolve, reject) => {
      reject(new Error("test"))
    })

    syncMap.setStatus(destinationId, promise)
    expect(syncMap.checkStatus(destinationId)).toBe(false)

    await promise.catch(() => {})

    expect(syncMap.checkStatus(destinationId)).toBe(false)
  })
})

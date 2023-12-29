import type { SyncKey, SyncTarget } from "./interface/sync"

export function makeSyncKey(id: string): SyncKey {
  return id as SyncKey
}

export class SyncMap {
  private _map: Map<SyncKey, SyncTarget>

  constructor(syncIds: SyncKey[]) {
    this._map = new Map()

    syncIds.forEach((id) => {
      this._map.set(id, {
        id,
        status: "not-synced",
      })
    })
  }

  public checkStatus(id: SyncKey): boolean {
    const destination = this._map.get(id)

    if (!destination) {
      return false
    }

    if (!destination.lastSyncedAt) {
      return false
    }

    return destination.status === "synced"
  }

  public setStatus(id: SyncKey, promise: Promise<unknown>): void {
    const destination = this._map.get(id)

    if (destination) {
      promise
        .then((resolvedValue: unknown) => {
          destination.status = "synced"
          destination.lastSyncedAt = new Date()

          return resolvedValue
        })
        .catch(() => {
          destination.status = "error"
        })
    }
  }
}

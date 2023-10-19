import type { Opaque } from "type-fest"

export type SyncKey = Opaque<string, "sync-key">

export type SyncStatus = "not-synced" | "syncing" | "synced" | "error"

export type SyncTarget = {
  id: SyncKey
  status: SyncStatus
  lastSyncedAt?: Date
}

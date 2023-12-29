import { createId } from "@paralleldrive/cuid2"
import { EntityKey } from "./interface"

export function generateId(): EntityKey {
  return createId() as EntityKey
}

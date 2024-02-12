import { createStorage } from "unstorage"
import { seedEntities } from "./seed"

export function databaseFactory() {
  const db = createStorage()
  seedEntities(db)

  return db
}

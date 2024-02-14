import { createStorage } from "unstorage"
import { seedEntities } from "./seed"

export async function databaseFactory() {
  const db = createStorage()
  await seedEntities(db)

  return db
}

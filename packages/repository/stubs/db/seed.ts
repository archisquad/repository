import { bookSchema } from "stubs/entities/book"
import type { Storage } from "unstorage"
import { generateMock } from "@anatine/zod-mock"

export async function seedEntities(db: Storage) {
  const book = Array.from({ length: 10 }, () => generateMock(bookSchema))
  // TODO: Seed other entities
  // TODO: Bind relations

  await db.setItem("books", [book])
}

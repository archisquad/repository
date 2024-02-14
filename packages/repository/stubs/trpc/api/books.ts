import { z } from "zod"
import { publicProcedure } from "../trpc"
import { bookSchema, type Book } from "../../entities/book"

export const getBooks = publicProcedure.query(({ ctx: { db } }) => {
  return db.getItem("books")
})
// TODO: Multiple CREATE/UPDATE/REMOVE

// TODO: Group them into a routers

export const getBook = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx: { db }, input: { id } }) => {
    const books = await db.getItem<Book[]>("books")
    return books?.find((book) => book.id === id) ?? []
  })

export const createBook = publicProcedure
  .input(bookSchema)
  .mutation(async ({ ctx: { db }, input }) => {
    const books = await db.getItem<Book[]>("books")
    return db.setItem("books", [...(books ?? []), input])
  })

export const updateBook = publicProcedure
  .input(
    z.object({
      id: z.string(),
      book: bookSchema,
    })
  )
  .mutation(async ({ ctx: { db }, input: { id, book } }) => {
    const books = await db.getItem<Book[]>("books")
    return db.setItem(
      "books",
      books?.map((b) => (b.id === id ? book : b)) ?? []
    )
  })

export const removeBook = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx: { db }, input: { id } }) => {
    const books = await db.getItem<Book[]>("books")
    return db.setItem("books", books?.filter((b) => b.id !== id) ?? [])
  })

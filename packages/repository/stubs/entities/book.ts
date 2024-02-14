import { z } from "zod"

export const bookSchema = z.object({
  id: z.string().cuid2(),
  title: z.string(),
  isbn: z.string(),
  pages: z.number(),
  format: z.enum(["paperback", "hardcover", "ebook"]),
  publisher: z.string(),
  publishedAt: z.date(),
  language: z.string(),
  description: z.string(),
  cover: z.string().url(),
  authors: z.array(z.string().cuid2()),
})

export type Book = z.infer<typeof bookSchema>

// TODO: Dodać schemat autora

// TODO: Dodać schemat recenzji

// TODO: Dodać schemat wypożyczenia

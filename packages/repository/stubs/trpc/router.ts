import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  removeBook,
} from "./api/books"
import { router } from "./trpc"

// TODO: Merge routers
export const appRouter = router({
  getBooks,
  getBook,
  createBook,
  updateBook,
  removeBook,
})

export type AppRouter = typeof appRouter

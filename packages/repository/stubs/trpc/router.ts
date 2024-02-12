import { getBooks } from './api/books';
import { router } from './trpc';

export const appRouter = router({
  getBooks,
});

export type AppRouter = typeof appRouter;

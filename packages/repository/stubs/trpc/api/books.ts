import { publicProcedure } from "../trpc"

// TODO: How to add the database to the context?
export const getBooks = publicProcedure.query(() => {
  return [
    { id: 1, title: "Book 1" },
    { id: 2, title: "Book 2" },
  ]
})

// TODO: Single GET
// TODO: Create/Update/Remove
// TODO: Multiple CREATE/UPDATE/REMOVE

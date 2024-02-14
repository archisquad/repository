import { createHTTPServer } from "@trpc/server/adapters/standalone"
import { appRouter } from "./router"
import { databaseFactory } from "stubs/db/factory"

const db = await databaseFactory()

// TODO: Move Context to trcp.ts
// TODO: Modify to get DB from the args
const createContext = () => {
  return {
    db,
  }
}

// TODO: Add error handling
const server = createHTTPServer({
  router: appRouter,
  createContext,
})

// Add logging
server.listen(3000)

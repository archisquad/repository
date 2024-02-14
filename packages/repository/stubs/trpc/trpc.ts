import { initTRPC } from "@trpc/server"
import type { Storage } from "unstorage"

type Context = {
  db: Storage
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

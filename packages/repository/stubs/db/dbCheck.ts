import { databaseFactory } from "./factory"

const db = await databaseFactory()

// biome-ignore lint/suspicious/noConsoleLog: manual check for the data
console.log("books", await db.getItem("books"))

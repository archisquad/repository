import { databaseFactory } from "./factory"

const db = databaseFactory()

// biome-ignore lint/suspicious/noConsoleLog: manual check for the data
console.log("books", await db.getItem("books"))

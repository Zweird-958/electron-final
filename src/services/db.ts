import Database from "better-sqlite3"
import { app } from "electron"
import path from "node:path"

import log from "./logger"
import { SCHEMA } from "./schema"

const dbPath = path.join(app.getPath("userData"), "caisse.db")
const db = new Database(dbPath)

db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")
db.exec(SCHEMA)

log.info("Database ready at", dbPath)

export default db

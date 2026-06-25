import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

const logDir = app.getPath('logs')
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

const logPath = path.join(logDir, 'main.log')
const stream = fs.createWriteStream(logPath, { flags: 'a' })

function format(level: string, ...args: unknown[]): string {
  const ts = new Date().toISOString()
  const msg = args.map((a) => (a instanceof Error ? a.stack ?? a.message : String(a))).join(' ')
  return `[${ts}] [${level}] ${msg}\n`
}

const log = {
  info: (...args: unknown[]) => { const line = format('info', ...args); process.stdout.write(line); stream.write(line) },
  warn: (...args: unknown[]) => { const line = format('warn', ...args); process.stdout.write(line); stream.write(line) },
  error: (...args: unknown[]) => { const line = format('error', ...args); process.stderr.write(line); stream.write(line) },
  path: logPath,
}

export default log

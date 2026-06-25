import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'
import log from './logger'

const dbPath = path.join(app.getPath('userData'), 'caisse.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function migrate() {
  const version = db.pragma('user_version', { simple: true }) as number

  if (version < 1) {
    db.exec(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT UNIQUE,
        name TEXT NOT NULL,
        brand TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        category TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total REAL NOT NULL,
        items_count INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      );

      CREATE INDEX idx_products_barcode ON products(barcode);
      CREATE INDEX idx_products_name ON products(name);
      CREATE INDEX idx_sales_created_at ON sales(created_at);
      CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
    `)
    db.pragma('user_version = 1')
    log.info('Database migrated to v1')
  }

  if (version < 2) {
    db.exec(`ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0`)
    db.pragma('user_version = 2')
    log.info('Database migrated to v2 (added stock)')
  }
}

migrate()
log.info('Database ready at', dbPath)

export default db

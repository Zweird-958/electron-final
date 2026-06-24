import db from '../services/db'
import type { Sale, SaleItem } from '../../src/types/sale.types'

const queryInsertSale = db.prepare(
  'INSERT INTO sales (total, items_count) VALUES (?, ?)'
)
const queryInsertSaleItem = db.prepare(
  'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)'
)
const queryListSales = db.prepare('SELECT * FROM sales ORDER BY created_at DESC')
const queryFindSalesByDate = db.prepare(
  `SELECT * FROM sales WHERE date(created_at) = date(?) ORDER BY created_at DESC`
)
const queryFindSaleById = db.prepare('SELECT * FROM sales WHERE id = ?')
const queryFindSaleItemsBySaleId = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?')
const queryTopProductsByDate = db.prepare(`
  SELECT si.product_name as name, SUM(si.quantity) as quantity
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  WHERE date(s.created_at) = date(?)
  GROUP BY si.product_name
  ORDER BY quantity DESC
  LIMIT 5
`)

export function insertSale(total: number, itemsCount: number): number {
  const info = queryInsertSale.run(total, itemsCount)
  return Number(info.lastInsertRowid)
}

export function insertSaleItem(
  saleId: number,
  productId: number,
  productName: string,
  quantity: number,
  unitPrice: number,
  total: number
): void {
  queryInsertSaleItem.run(saleId, productId, productName, quantity, unitPrice, total)
}

export function findAll(): Sale[] {
  return queryListSales.all() as Sale[]
}

export function findByDate(date: string): Sale[] {
  return queryFindSalesByDate.all(date) as Sale[]
}

export function findById(id: number): Sale | undefined {
  return queryFindSaleById.get(id) as Sale | undefined
}

export function findItemsBySaleId(saleId: number): SaleItem[] {
  return queryFindSaleItemsBySaleId.all(saleId) as SaleItem[]
}

export function findTopProductsByDate(date: string): { name: string; quantity: number }[] {
  return queryTopProductsByDate.all(date) as { name: string; quantity: number }[]
}

const queryTopProductsRevenueByDate = db.prepare(`
  SELECT si.product_name as name, SUM(si.quantity) as quantity, SUM(si.total) as revenue
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  WHERE date(s.created_at) = date(?)
  GROUP BY si.product_name
  ORDER BY revenue DESC
  LIMIT 10
`)

const queryTotalItemsSoldByDate = db.prepare(`
  SELECT COALESCE(SUM(items_count), 0) as total
  FROM sales WHERE date(created_at) = date(?)
`)

const queryRecentSales = db.prepare(
  'SELECT id, total, items_count, created_at FROM sales ORDER BY created_at DESC LIMIT 10'
)

export const findTopProductsRevenueByDate = (date: string): { name: string; quantity: number; revenue: number }[] =>
  queryTopProductsRevenueByDate.all(date) as { name: string; quantity: number; revenue: number }[]

export const totalItemsSoldByDate = (date: string): number =>
  (queryTotalItemsSoldByDate.get(date) as { total: number }).total

export const findRecentSales = (): { id: number; total: number; items_count: number; created_at: string }[] =>
  queryRecentSales.all() as { id: number; total: number; items_count: number; created_at: string }[]

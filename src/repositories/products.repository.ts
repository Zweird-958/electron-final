import type { Product } from "../../src/types/product.types"
import db from "../services/db"

const queryListProducts = db.prepare("SELECT * FROM products ORDER BY name ASC")
const queryFindProductById = db.prepare("SELECT * FROM products WHERE id = ?")
const queryFindProductByBarcode = db.prepare(
  "SELECT * FROM products WHERE barcode = ?",
)
const querySearchProducts = db.prepare(
  `SELECT * FROM products WHERE name LIKE ? OR barcode LIKE ? OR brand LIKE ? ORDER BY name ASC LIMIT 50`,
)
const queryInsertProduct = db.prepare(
  "INSERT INTO products (barcode, name, brand, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?, ?)",
)
const queryUpdateProduct = db.prepare(
  "UPDATE products SET barcode = ?, name = ?, brand = ?, price = ?, stock = ?, image_url = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
)
const queryDeleteProduct = db.prepare("DELETE FROM products WHERE id = ?")
const queryDecrementProductStock = db.prepare(
  "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
)

export function findAll(): Product[] {
  return queryListProducts.all() as Product[]
}

export function findById(id: number): Product | undefined {
  return queryFindProductById.get(id) as Product | undefined
}

export function findByBarcode(barcode: string): Product | undefined {
  return queryFindProductByBarcode.get(barcode) as Product | undefined
}

export function search(query: string): Product[] {
  const term = `%${query}%`
  return querySearchProducts.all(term, term, term) as Product[]
}

export function insert(
  barcode: string | null,
  name: string,
  brand: string | null,
  price: number,
  stock: number,
  imageUrl: string | null,
  category: string | null,
): number {
  const info = queryInsertProduct.run(
    barcode,
    name,
    brand,
    price,
    stock,
    imageUrl,
    category,
  )
  return Number(info.lastInsertRowid)
}

export function update(
  id: number,
  barcode: string | null,
  name: string,
  brand: string | null,
  price: number,
  stock: number,
  imageUrl: string | null,
  category: string | null,
): void {
  queryUpdateProduct.run(
    barcode,
    name,
    brand,
    price,
    stock,
    imageUrl,
    category,
    id,
  )
}

export function remove(id: number): void {
  queryDeleteProduct.run(id)
}

export function decrementStock(id: number, quantity: number): boolean {
  const info = queryDecrementProductStock.run(quantity, id, quantity)
  return info.changes > 0
}

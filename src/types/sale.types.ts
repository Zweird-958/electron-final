import type { Product } from './product.types'

export type Sale = {
  id: number
  total: number
  items_count: number
  created_at: string
}

export type SaleItem = {
  id: number
  sale_id: number
  product_id: number | null
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export type SaleWithItems = Sale & {
  items: SaleItem[]
}

export type CartItem = {
  product: Product
  quantity: number
}

export type DailySummary = {
  date: string
  total_sales: number
  total_revenue: number
  top_products: { name: string; quantity: number }[]
}

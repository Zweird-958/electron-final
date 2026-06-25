import db from './db'
import * as salesRepo from '../repositories/sales.repository'
import * as productsService from './products.service'
import type { Sale, SaleWithItems, DailySummary } from '../../src/types/sale.types'

type CreateSaleInput = {
  items: {
    product_id: number
    product_name: string
    quantity: number
    unit_price: number
  }[]
}

const createSaleTx = db.transaction((input: CreateSaleInput) => {
  const total = input.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const itemsCount = input.items.reduce((sum, i) => sum + i.quantity, 0)

  const saleId = salesRepo.insertSale(
    Math.round(total * 100) / 100,
    itemsCount
  )

  for (const item of input.items) {
    const itemTotal = Math.round(item.quantity * item.unit_price * 100) / 100
    salesRepo.insertSaleItem(
      saleId,
      item.product_id,
      item.product_name,
      item.quantity,
      item.unit_price,
      itemTotal
    )
    productsService.decrementStock(item.product_id, item.quantity)
  }

  return saleId
})

export function create(input: CreateSaleInput): number {
  return createSaleTx(input)
}

export function list(): Sale[] {
  return salesRepo.findAll()
}

export function listByDate(date: string): Sale[] {
  return salesRepo.findByDate(date)
}

export function get(id: number): SaleWithItems | undefined {
  const sale = salesRepo.findById(id)
  if (!sale) return undefined
  const items = salesRepo.findItemsBySaleId(id)
  return { ...sale, items }
}

export function dailySummary(date: string): DailySummary {
  const sales = salesRepo.findByDate(date)
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
  const topProducts = salesRepo.findTopProductsByDate(date)

  return {
    date,
    total_sales: sales.length,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    top_products: topProducts,
  }
}

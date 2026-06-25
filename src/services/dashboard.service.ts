import type { DashboardData } from "../../src/types/dashboard.types"
import * as salesRepo from "../repositories/sales.repository"

export const getSummary = (): DashboardData => {
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  const todaySales = salesRepo.findByDate(today)
  const yesterdaySales = salesRepo.findByDate(yesterday)

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + s.total, 0)

  return {
    today: {
      revenue: Math.round(todayRevenue * 100) / 100,
      salesCount: todaySales.length,
      itemsSold: salesRepo.totalItemsSoldByDate(today),
    },
    yesterday: {
      revenue: Math.round(yesterdayRevenue * 100) / 100,
      salesCount: yesterdaySales.length,
    },
    topProducts: salesRepo.findTopProductsRevenueByDate(today),
    recentSales: salesRepo.findRecentSales(),
  }
}

export type DashboardData = {
  today: {
    revenue: number
    salesCount: number
    itemsSold: number
  }
  yesterday: {
    revenue: number
    salesCount: number
  }
  topProducts: { name: string; quantity: number; revenue: number }[]
  recentSales: {
    id: number
    total: number
    items_count: number
    created_at: string
  }[]
}

export type ImportProgress = {
  total: number
  processed: number
  success: number
  errors: { line: number; reason: string }[]
  done: boolean
}

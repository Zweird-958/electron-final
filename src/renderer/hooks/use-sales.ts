import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Sale, SaleWithItems, DailySummary } from '@/types'

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = dateFilter
      ? await api.sales.getByDate(dateFilter)
      : await api.sales.list()
    setSales(data)
    setLoading(false)
  }, [dateFilter])

  useEffect(() => { refresh() }, [refresh])

  const getSale = useCallback(async (id: number): Promise<SaleWithItems | undefined> => {
    return api.sales.get(id)
  }, [])

  const getSummary = useCallback(async (date: string): Promise<DailySummary> => {
    return api.sales.dailySummary(date)
  }, [])

  const exportCsv = useCallback(async () => {
    return api.sales.exportCsv(sales)
  }, [sales])

  const exportPdf = useCallback(async () => {
    return api.sales.exportPdf(sales)
  }, [sales])

  return { sales, loading, dateFilter, setDateFilter, refresh, getSale, getSummary, exportCsv, exportPdf }
}

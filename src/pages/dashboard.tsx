import { useState, useEffect } from 'react'
import { DashboardStatCards } from '@/components/dashboard/stat-cards'
import { TopProductsCard } from '@/components/dashboard/top-products-card'
import { RecentSalesCard } from '@/components/dashboard/recent-sales-card'
import { SaleDetailDialog } from '@/components/sales/sale-detail-dialog'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { DashboardData } from '@/types'

export const DashboardPage = () => {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    api.dashboard.summary().then(setData)
  }, [])

  if (!data) return <p className="p-6 text-sm text-muted-foreground">{t('common.loading')}</p>

  return (
    <div className="flex h-full flex-col overflow-auto p-6 space-y-6">
      <h1 className="text-lg font-bold">{t('dashboard.title')}</h1>

      <DashboardStatCards data={data} />

      <div className="grid grid-cols-2 gap-6">
        <TopProductsCard products={data.topProducts} />
        <RecentSalesCard
          sales={data.recentSales}
          onSelect={(id) => { setDetailId(id); setDetailOpen(true) }}
        />
      </div>

      <SaleDetailDialog saleId={detailId} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  )
}

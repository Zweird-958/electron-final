import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { api } from "@/lib/api"
import { RecentSalesCard } from "@/renderer/components/dashboard/recent-sales-card"
import { DashboardStatCards } from "@/renderer/components/dashboard/stat-cards"
import { TopProductsCard } from "@/renderer/components/dashboard/top-products-card"
import { SaleDetailDialog } from "@/renderer/components/sales/sale-detail-dialog"
import type { DashboardData } from "@/types"

export const DashboardPage = () => {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    api.dashboard.summary().then(setData)
  }, [])

  if (!data)
    return (
      <p className="text-muted-foreground p-6 text-sm">{t("common.loading")}</p>
    )

  return (
    <div className="flex h-full flex-col space-y-6 overflow-auto p-6">
      <h1 className="text-lg font-bold">{t("dashboard.title")}</h1>

      <DashboardStatCards data={data} />

      <div className="grid grid-cols-2 gap-6">
        <TopProductsCard products={data.topProducts} />
        <RecentSalesCard
          sales={data.recentSales}
          onSelect={(id) => {
            setDetailId(id)
            setDetailOpen(true)
          }}
        />
      </div>

      <SaleDetailDialog
        saleId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

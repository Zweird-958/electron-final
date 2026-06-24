import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, ShoppingBag, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { SaleDetailDialog } from '@/components/sales/sale-detail-dialog'
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

  const revenueDiff = data.today.revenue - data.yesterday.revenue
  const salesDiff = data.today.salesCount - data.yesterday.salesCount

  return (
    <div className="flex h-full flex-col overflow-auto p-6 space-y-6">
      <h1 className="text-lg font-bold">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="size-4" />
              {t('dashboard.todayRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.today.revenue.toFixed(2)} €</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {revenueDiff >= 0 ? (
                <TrendingUp className="size-3 text-green-600" />
              ) : (
                <TrendingDown className="size-3 text-red-600" />
              )}
              <span className={revenueDiff >= 0 ? 'text-green-600' : 'text-red-600'}>
                {revenueDiff >= 0 ? '+' : ''}{revenueDiff.toFixed(2)} €
              </span>
              <span className="text-muted-foreground">{t('dashboard.vsYesterday')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShoppingBag className="size-4" />
              {t('dashboard.todaySales')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.today.salesCount}</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {salesDiff >= 0 ? (
                <TrendingUp className="size-3 text-green-600" />
              ) : (
                <TrendingDown className="size-3 text-red-600" />
              )}
              <span className={salesDiff >= 0 ? 'text-green-600' : 'text-red-600'}>
                {salesDiff >= 0 ? '+' : ''}{salesDiff}
              </span>
              <span className="text-muted-foreground">{t('dashboard.vsYesterday')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="size-4" />
              {t('dashboard.todayItems')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.today.itemsSold}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('dashboard.topProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('dashboard.noData')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.product')}</TableHead>
                    <TableHead className="text-center">{t('dashboard.quantity')}</TableHead>
                    <TableHead className="text-right">{t('dashboard.revenue')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topProducts.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{p.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{p.revenue.toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('dashboard.recentSales')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('dashboard.noData')}</p>
            ) : (
              <div className="space-y-2">
                {data.recentSales.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setDetailId(s.id); setDetailOpen(true) }}
                    className="flex w-full items-center justify-between rounded-lg border border-border p-2 text-sm transition-colors hover:bg-accent"
                  >
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">#{s.id}</span>
                      <span className="ml-2">{s.items_count} {t('sales.items')}</span>
                    </div>
                    <span className="font-semibold">{s.total.toFixed(2)} €</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <SaleDetailDialog saleId={detailId} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  )
}

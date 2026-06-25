import { Eye, FileDown, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { SaleDetailDialog } from "@/renderer/components/sales/sale-detail-dialog"
import { SalesSummaryCards } from "@/renderer/components/sales/sales-summary-cards"
import { Badge } from "@/renderer/components/ui/badge"
import { Button } from "@/renderer/components/ui/button"
import { Input } from "@/renderer/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/renderer/components/ui/table"
import { useSales } from "@/renderer/hooks/use-sales"
import type { DailySummary } from "@/types"

export const SalesPage = () => {
  const { t } = useTranslation()
  const {
    sales,
    loading,
    dateFilter,
    setDateFilter,
    exportCsv,
    exportPdf,
    getSummary,
  } = useSales()
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [summary, setSummary] = useState<DailySummary | null>(null)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    getSummary(today).then(setSummary)
  }, [getSummary, today])

  const openDetail = (id: number) => {
    setDetailId(id)
    setDetailOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-bold">{t("sales.title")}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={sales.length === 0}
          >
            <FileDown className="size-4" />
            {t("sales.exportCsv")}
          </Button>
          <Button
            variant="outline"
            onClick={exportPdf}
            disabled={sales.length === 0}
          >
            <FileText className="size-4" />
            {t("sales.exportPdf")}
          </Button>
        </div>
      </div>

      {summary && <SalesSummaryCards summary={summary} />}

      <div className="border-border border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">{t("sales.date")} :</label>
          <Input
            type="date"
            value={dateFilter ?? ""}
            onChange={(e) => setDateFilter(e.target.value || null)}
            className="w-44"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDateFilter(today)}
          >
            {t("sales.filterToday")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDateFilter(null)}>
            {t("sales.filterAll")}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {t("common.loading")}
          </p>
        ) : sales.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {t("sales.empty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t("sales.date")}</TableHead>
                <TableHead className="text-center">
                  {t("sales.items")}
                </TableHead>
                <TableHead className="text-right">{t("sales.total")}</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                  <TableCell>
                    {new Date(sale.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{sale.items_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {sale.total.toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openDetail(sale.id)}
                    >
                      <Eye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <SaleDetailDialog
        saleId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

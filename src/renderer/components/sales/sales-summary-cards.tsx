import { ShoppingBag, Star, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/renderer/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card"
import type { DailySummary } from "@/types"

type Props = {
  summary: DailySummary
}

export const SalesSummaryCards = ({ summary }: Props) => {
  const { t } = useTranslation()

  return (
    <div className="border-border grid grid-cols-3 gap-4 border-b px-6 py-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="size-4" />
            {t("sales.summaryRevenue")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {summary.total_revenue.toFixed(2)} €
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="size-4" />
            {t("sales.summaryCount")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.total_sales}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Star className="size-4" />
            {t("sales.summaryTop")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.top_products.length > 0 ? (
            <ul className="space-y-1">
              {summary.top_products.slice(0, 3).map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{p.name}</span>
                  <Badge variant="secondary">{p.quantity}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">—</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Search } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { api } from "@/lib/api"
import { Badge } from "@/renderer/components/ui/badge"
import { Input } from "@/renderer/components/ui/input"
import type { Product } from "@/types"

type Props = {
  onSelect: (product: Product) => void
  cartQuantities: Record<number, number>
  refreshKey: number
}

export const ProductSearch = ({
  onSelect,
  cartQuantities,
  refreshKey,
}: Props) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])

  const fetchProducts = useCallback(async () => {
    if (query.trim().length >= 1) {
      const data = await api.products.search(query)
      setResults(data)
    } else {
      const data = await api.products.list()
      setResults(data)
    }
  }, [query])

  useEffect(() => {
    fetchProducts()
  }, [refreshKey, fetchProducts])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 200)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  const remainingStock = (product: Product): number => {
    const inCart = cartQuantities[product.id] ?? 0
    return product.stock - inCart
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-border relative border-b p-4">
        <Search className="text-muted-foreground absolute top-1/2 left-7 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("catalog.search")}
          className="pl-9"
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {results.map((product) => {
            const remaining = remainingStock(product)
            const disabled = remaining <= 0

            return (
              <button
                key={product.id}
                onClick={() => !disabled && onSelect(product)}
                disabled={disabled}
                className="border-border bg-card hover:bg-accent flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="size-10 rounded-md object-cover"
                  />
                )}
                <p className="line-clamp-2 text-sm leading-tight font-medium">
                  {product.name}
                </p>
                {product.brand && (
                  <p className="text-muted-foreground text-xs">
                    {product.brand}
                  </p>
                )}
                <div className="flex w-full items-center justify-between gap-2">
                  <p className="text-primary text-sm font-bold">
                    {product.price.toFixed(2)} €
                  </p>
                  {remaining <= 0 ? (
                    <Badge variant="destructive" className="text-[10px]">
                      {t("products.stockOut")}
                    </Badge>
                  ) : remaining <= 5 ? (
                    <Badge
                      variant="outline"
                      className="border-amber-400 text-[10px] text-amber-600"
                    >
                      {remaining}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {remaining}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {results.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {t("products.empty")}
          </p>
        )}
      </div>
    </div>
  )
}

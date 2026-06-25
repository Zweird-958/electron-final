import { Loader2, Plus, Search, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { toast } from "sonner"

import { api } from "@/lib/api"
import { ProductFormDialog } from "@/renderer/components/products/product-form-dialog"
import { ProductTable } from "@/renderer/components/products/product-table"
import { Badge } from "@/renderer/components/ui/badge"
import { Button } from "@/renderer/components/ui/button"
import { Input } from "@/renderer/components/ui/input"
import { useProducts } from "@/renderer/hooks/use-products"
import type { Product, ProductInput } from "@/types"

export const ProductsPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { products, loading, search, create, update, remove, refresh } =
    useProducts()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (location.state?.openAddProduct) {
      setEditingProduct(null)
      setDialogOpen(true)
      window.history.replaceState({}, "")
    }
  }, [location.state])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    search(value)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleSave = async (input: ProductInput, id?: number) => {
    if (id) {
      await update(id, input)
    } else {
      await create(input)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const result = await api.import.csv()
      if (!result) {
        setImporting(false)
        return
      }

      await refresh()

      if (result.errors.length > 0) {
        toast.warning(
          t("products.importSuccess", { success: result.success }),
          {
            description: t("products.importErrors", {
              count: result.errors.length,
            }),
          },
        )
      } else {
        toast.success(t("products.importSuccess", { success: result.success }))
      }
    } catch {
      toast.error(t("common.error"))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">{t("products.title")}</h1>
          <Badge variant="secondary">
            {products.length} {t("products.count")}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport} disabled={importing}>
            {importing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {t("products.import")}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            {t("products.add")}
          </Button>
        </div>
      </div>

      <div className="border-border border-b px-6 py-3">
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t("products.search")}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {t("common.loading")}
          </p>
        ) : (
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={remove}
          />
        )}
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  )
}

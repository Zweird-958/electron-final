import { useState } from 'react'
import { Plus, Search, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProductTable } from '@/components/products/product-table'
import { ProductFormDialog } from '@/components/products/product-form-dialog'
import { useProducts } from '@/hooks/use-products'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { Product, ProductInput } from '@/types'

export const ProductsPage = () => {
  const { t } = useTranslation()
  const { products, loading, search, create, update, remove, refresh } = useProducts()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [importing, setImporting] = useState(false)

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
        toast.warning(t('products.importSuccess', { success: result.success }), {
          description: t('products.importErrors', { count: result.errors.length }),
        })
      } else {
        toast.success(t('products.importSuccess', { success: result.success }))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">{t('products.title')}</h1>
          <Badge variant="secondary">
            {products.length} {t('products.count')}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport} disabled={importing}>
            {importing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {t('products.import')}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            {t('products.add')}
          </Button>
        </div>
      </div>

      <div className="border-b border-border px-6 py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('products.search')}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <ProductTable products={products} onEdit={handleEdit} onDelete={remove} />
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

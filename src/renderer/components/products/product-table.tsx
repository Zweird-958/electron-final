import { Pencil, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/renderer/components/ui/badge"
import { Button } from "@/renderer/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/renderer/components/ui/table"
import type { Product } from "@/types"

type Props = {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export const ProductTable = ({ products, onEdit, onDelete }: Props) => {
  const { t } = useTranslation()

  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        {t("products.empty")}
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">{t("products.barcode")}</TableHead>
          <TableHead>{t("products.name")}</TableHead>
          <TableHead>{t("products.brand")}</TableHead>
          <TableHead>{t("products.category")}</TableHead>
          <TableHead className="text-center">{t("products.stock")}</TableHead>
          <TableHead className="text-right">{t("products.price")}</TableHead>
          <TableHead className="w-[100px] text-right">
            {t("common.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-mono text-xs">
              {product.barcode ?? "—"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt=""
                    className="size-8 rounded object-cover"
                  />
                )}
                <span className="font-medium">{product.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {product.brand ?? "—"}
            </TableCell>
            <TableCell>
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
            </TableCell>
            <TableCell className="text-center">
              {product.stock === 0 ? (
                <Badge variant="destructive">{t("products.stockOut")}</Badge>
              ) : product.stock <= 5 ? (
                <Badge
                  variant="outline"
                  className="border-amber-400 text-amber-600"
                >
                  {product.stock}
                </Badge>
              ) : (
                <span className="text-sm font-medium">{product.stock}</span>
              )}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {product.price.toFixed(2)} €
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onEdit(product)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

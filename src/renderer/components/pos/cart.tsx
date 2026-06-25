import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/renderer/components/ui/button"
import type { CartItem } from "@/types"

type Props = {
  items: CartItem[]
  total: number
  itemsCount: number
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemove: (productId: number) => void
  onClear: () => void
  onCheckout: () => void
}

export const Cart = ({
  items,
  total,
  itemsCount,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckout,
}: Props) => {
  const { t } = useTranslation()

  return (
    <div className="border-border bg-card flex h-full flex-col border-l">
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-4" />
          <h2 className="text-sm font-semibold">{t("pos.cart")}</h2>
          {itemsCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
              {itemsCount}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="xs" onClick={onClear}>
            {t("pos.cartClear")}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {t("pos.cartEmpty")}
          </p>
        ) : (
          <div className="space-y-2">
            {items.map(({ product, quantity }) => {
              const atMax = quantity >= product.stock
              return (
                <div
                  key={product.id}
                  className="border-border flex items-center gap-2 rounded-lg border p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {product.price.toFixed(2)} € · {t("products.stock")}:{" "}
                      {product.stock - quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                    >
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                      disabled={atMax}
                    >
                      <Plus />
                    </Button>
                  </div>

                  <p className="w-16 text-right text-sm font-semibold">
                    {(product.price * quantity).toFixed(2)} €
                  </p>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onRemove(product.id)}
                    className="text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-border border-t p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">{t("pos.cartTotal")}</span>
          <span className="text-2xl font-bold">{total.toFixed(2)} €</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          {t("pos.cartValidate")}
        </Button>
      </div>
    </div>
  )
}

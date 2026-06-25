import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { api } from "@/lib/api"
import { Cart } from "@/renderer/components/pos/cart"
import { ProductSearch } from "@/renderer/components/pos/product-search"
import { useCart } from "@/renderer/hooks/use-cart"

export const PosPage = () => {
  const { t } = useTranslation()
  const {
    items,
    total,
    itemsCount,
    cartQuantities,
    addProduct,
    updateQuantity,
    removeItem,
    clear,
    checkout,
  } = useCart()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCheckout = async () => {
    const saleId = await checkout()
    if (saleId) {
      setRefreshKey((k) => k + 1)
      toast.success(t("pos.saleSuccess"), {
        description: `Ticket #${saleId} — ${total.toFixed(2)} €`,
      })
      await api.system.notify(
        t("pos.saleSuccess"),
        `Ticket #${saleId} — ${total.toFixed(2)} €`,
      )
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <ProductSearch
          onSelect={addProduct}
          cartQuantities={cartQuantities}
          refreshKey={refreshKey}
        />
      </div>
      <div className="w-80 lg:w-96">
        <Cart
          items={items}
          total={total}
          itemsCount={itemsCount}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
          onClear={clear}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  )
}

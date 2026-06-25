import { useCallback, useMemo, useState } from "react"

import { api } from "@/lib/api"
import type { CartItem, Product } from "@/types"

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([])

  const addProduct = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      const currentQty = existing?.quantity ?? 0

      if (currentQty >= product.stock) return prev

      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.product.id !== productId)
      }
      return prev.map((i) => {
        if (i.product.id !== productId) return i
        const clamped = Math.min(quantity, i.product.stock)
        return { ...i, quantity: clamped }
      })
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total = useMemo(
    () =>
      Math.round(
        items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) * 100,
      ) / 100,
    [items],
  )

  const itemsCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const cartQuantities = useMemo(
    () => Object.fromEntries(items.map((i) => [i.product.id, i.quantity])),
    [items],
  )

  const checkout = useCallback(async () => {
    if (items.length === 0) return null

    const saleId = await api.sales.create({
      items: items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.price,
      })),
    })

    clear()
    return saleId
  }, [items, clear])

  return {
    items,
    total,
    itemsCount,
    cartQuantities,
    addProduct,
    updateQuantity,
    removeItem,
    clear,
    checkout,
  }
}

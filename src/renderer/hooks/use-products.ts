import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Product, ProductInput } from '@/types'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await api.products.list()
    setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return refresh()
    setLoading(true)
    const data = await api.products.search(query)
    setProducts(data)
    setLoading(false)
  }, [refresh])

  const create = useCallback(async (input: ProductInput) => {
    const id = await api.products.create(input)
    await refresh()
    return id
  }, [refresh])

  const update = useCallback(async (id: number, input: ProductInput) => {
    await api.products.update(id, input)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    const confirmed = await api.system.confirm('Supprimer ce produit ?')
    if (!confirmed) return
    await api.products.delete(id)
    await refresh()
  }, [refresh])

  return { products, loading, refresh, search, create, update, remove }
}

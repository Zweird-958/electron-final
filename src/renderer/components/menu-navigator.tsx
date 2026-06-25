import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { MENU } from "@/channels"
import { api } from "@/lib/api"

export const MenuNavigator = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => {
      navigate("/products", { state: { openAddProduct: true } })
    }
    api.on(MENU.ADD_PRODUCT, handler)
    return () => api.off(MENU.ADD_PRODUCT, handler)
  }, [navigate])

  return null
}

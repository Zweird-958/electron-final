export type Product = {
  id: number
  barcode: string | null
  name: string
  brand: string | null
  price: number
  stock: number
  image_url: string | null
  category: string | null
  created_at: string
  updated_at: string
}

export type ProductInput = {
  barcode?: string | null
  name: string
  brand?: string | null
  price: number
  stock?: number
  image_url?: string | null
  category?: string | null
}

export type OpenFoodFactsProduct = {
  code: string
  product_name: string
  brands: string
  image_url: string
  categories: string
}

import type { Product, ProductInput } from "../../src/types/product.types"
import * as productsRepo from "../repositories/products.repository"

export function list(): Product[] {
  return productsRepo.findAll()
}

export function get(id: number): Product | undefined {
  return productsRepo.findById(id)
}

export function getByBarcode(barcode: string): Product | undefined {
  return productsRepo.findByBarcode(barcode)
}

export function search(query: string): Product[] {
  return productsRepo.search(query)
}

export function create(input: ProductInput): number {
  return productsRepo.insert(
    input.barcode ?? null,
    input.name,
    input.brand ?? null,
    input.price,
    input.stock ?? 0,
    input.image_url ?? null,
    input.category ?? null,
  )
}

export function update(id: number, input: ProductInput): void {
  productsRepo.update(
    id,
    input.barcode ?? null,
    input.name,
    input.brand ?? null,
    input.price,
    input.stock ?? 0,
    input.image_url ?? null,
    input.category ?? null,
  )
}

export function remove(id: number): void {
  productsRepo.remove(id)
}

export function decrementStock(id: number, quantity: number): boolean {
  return productsRepo.decrementStock(id, quantity)
}

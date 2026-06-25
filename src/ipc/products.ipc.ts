import { ipcMain } from "electron"

import type { ProductInput } from "../../src/types"
import { PRODUCTS } from "../channels"
import * as offService from "../services/openfoodfacts.service"
import * as productsService from "../services/products.service"

export function register() {
  ipcMain.handle(PRODUCTS.LIST, () => {
    return productsService.list()
  })

  ipcMain.handle(PRODUCTS.GET, (_e, id: number) => {
    return productsService.get(id)
  })

  ipcMain.handle(PRODUCTS.SEARCH, (_e, query: string) => {
    return productsService.search(query)
  })

  ipcMain.handle(PRODUCTS.CREATE, (_e, input: ProductInput) => {
    return productsService.create(input)
  })

  ipcMain.handle(PRODUCTS.UPDATE, (_e, id: number, input: ProductInput) => {
    productsService.update(id, input)
  })

  ipcMain.handle(PRODUCTS.DELETE, (_e, id: number) => {
    productsService.remove(id)
  })

  ipcMain.handle(PRODUCTS.LOOKUP_BARCODE, async (_e, barcode: string) => {
    const existing = productsService.getByBarcode(barcode)
    if (existing) {
      return { ok: true, data: existing, source: "local" as const }
    }
    const result = await offService.lookupBarcode(barcode)
    return { ...result, source: "openfoodfacts" as const }
  })
}

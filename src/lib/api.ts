import type { Product, ProductInput, Sale, SaleWithItems, DailySummary, AppSettings, ApiResult, OpenFoodFactsProduct, DashboardData, ImportProgress } from '@/types'

type API = {
  products: {
    list(): Promise<Product[]>
    get(id: number): Promise<Product | undefined>
    search(query: string): Promise<Product[]>
    create(input: ProductInput): Promise<number>
    update(id: number, input: ProductInput): Promise<void>
    delete(id: number): Promise<void>
    lookupBarcode(barcode: string): Promise<
      (ApiResult<OpenFoodFactsProduct> | ApiResult<Product>) & { source: 'local' | 'openfoodfacts' }
    >
  }
  sales: {
    create(input: { items: { product_id: number; product_name: string; quantity: number; unit_price: number }[] }): Promise<number>
    list(): Promise<Sale[]>
    get(id: number): Promise<SaleWithItems | undefined>
    getByDate(date: string): Promise<Sale[]>
    dailySummary(date: string): Promise<DailySummary>
    exportCsv(sales: Sale[]): Promise<string | null>
    exportPdf(sales: Sale[]): Promise<string | null>
  }
  import: {
    csv(): Promise<ImportProgress | null>
  }
  dashboard: {
    summary(): Promise<DashboardData>
  }
  receipt: {
    print(saleId: number): Promise<boolean>
    download(saleId: number): Promise<string | null>
  }
  updater: {
    check(): Promise<unknown>
    download(): Promise<boolean>
    install(): Promise<void>
  }
  settings: {
    get(): Promise<AppSettings>
    set(partial: Partial<AppSettings>): Promise<AppSettings>
  }
  system: {
    confirm(message: string): Promise<boolean>
    notify(title: string, body: string): Promise<void>
  }
  on(channel: string, callback: (...args: unknown[]) => void): void
  off(channel: string, callback: (...args: unknown[]) => void): void
}

declare global {
  interface Window {
    api: API
  }
}

export const api = window.api

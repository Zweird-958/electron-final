import type { ApiResult, OpenFoodFactsProduct } from '../../src/types'

const BASE_URL = 'https://world.openfoodfacts.net/api/v3.6/product'

export const lookupBarcode = async (
  barcode: string
): Promise<ApiResult<OpenFoodFactsProduct>> => {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)

  try {
    const res = await fetch(
      `${BASE_URL}/${encodeURIComponent(barcode)}.json`,
      { signal: ctrl.signal }
    )

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` }
    }

    const json = await res.json()
    if (!json.product) {
      return { ok: false, error: 'product_not_found' }
    }

    const p = json.product
    return {
      ok: true,
      data: {
        code: barcode,
        product_name: p.abbreviated_product_name || p.product_name || p.product_name_fr || '',
        brands: p.brands || '',
        image_url: p.image_front_small_url || p.image_url || '',
        categories: (p.categories_tags as string[] | undefined)?.join(', ') || p.categories || '',
      },
    }
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? 'timeout'
        : 'offline'
    return { ok: false, error: message }
  } finally {
    clearTimeout(timer)
  }
}

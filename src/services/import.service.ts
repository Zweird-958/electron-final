import fs from 'node:fs'
import db from './db'
import * as productsRepo from '../repositories/products.repository'
import type { ImportProgress } from '../../src/types/dashboard.types'

const insertIfNew = db.prepare(`
  INSERT OR IGNORE INTO products (barcode, name, brand, price, stock, image_url, category)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

export const importCsv = (
  filePath: string,
  onProgress: (progress: ImportProgress) => void
): ImportProgress => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split(/\r?\n/).filter((l) => l.trim())

  if (lines.length === 0) {
    const result: ImportProgress = { total: 0, processed: 0, success: 0, errors: [], done: true }
    onProgress(result)
    return result
  }

  const header = lines[0].toLowerCase()
  const sep = header.includes(';') ? ';' : ','
  const cols = header.split(sep).map((c) => c.trim())

  const nameIdx = cols.findIndex((c) => ['name', 'nom', 'product_name', 'produit'].includes(c))
  const priceIdx = cols.findIndex((c) => ['price', 'prix', 'unit_price'].includes(c))
  const barcodeIdx = cols.findIndex((c) => ['barcode', 'code_barres', 'ean', 'code'].includes(c))
  const brandIdx = cols.findIndex((c) => ['brand', 'marque', 'brands'].includes(c))
  const stockIdx = cols.findIndex((c) => ['stock', 'quantity', 'quantite'].includes(c))
  const categoryIdx = cols.findIndex((c) => ['category', 'categorie', 'categories'].includes(c))

  if (nameIdx === -1 || priceIdx === -1) {
    const result: ImportProgress = {
      total: 0, processed: 0, success: 0,
      errors: [{ line: 1, reason: 'Colonnes "name" et "price" requises' }],
      done: true,
    }
    onProgress(result)
    return result
  }

  const dataLines = lines.slice(1)
  const progress: ImportProgress = {
    total: dataLines.length, processed: 0, success: 0, errors: [], done: false,
  }

  const importTx = db.transaction(() => {
    for (let i = 0; i < dataLines.length; i++) {
      const fields = dataLines[i].split(sep).map((f) => f.trim().replace(/^"|"$/g, ''))
      const lineNum = i + 2

      const name = fields[nameIdx] || ''
      const priceStr = fields[priceIdx] || ''
      const price = parseFloat(priceStr.replace(',', '.'))

      if (!name) {
        progress.errors.push({ line: lineNum, reason: 'Nom manquant' })
        progress.processed++
        continue
      }

      if (isNaN(price) || price < 0) {
        progress.errors.push({ line: lineNum, reason: `Prix invalide: "${priceStr}"` })
        progress.processed++
        continue
      }

      const barcode = barcodeIdx >= 0 ? fields[barcodeIdx] || null : null
      const brand = brandIdx >= 0 ? fields[brandIdx] || null : null
      const stock = stockIdx >= 0 ? parseInt(fields[stockIdx], 10) || 0 : 0
      const category = categoryIdx >= 0 ? fields[categoryIdx] || null : null

      try {
        if (barcode) {
          const existing = productsRepo.findByBarcode(barcode)
          if (existing) {
            progress.errors.push({ line: lineNum, reason: `Code-barres déjà existant: ${barcode}` })
            progress.processed++
            continue
          }
        }
        insertIfNew.run(barcode, name, brand, price, stock, null, category)
        progress.success++
      } catch {
        progress.errors.push({ line: lineNum, reason: 'Erreur d\'insertion' })
      }
      progress.processed++

      if (progress.processed % 50 === 0) {
        onProgress({ ...progress })
      }
    }
  })

  importTx()
  progress.done = true
  onProgress({ ...progress })
  return progress
}

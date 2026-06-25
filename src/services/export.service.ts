import { BrowserWindow, app } from "electron"
import fs from "node:fs"
import path from "node:path"

import type { Sale, SaleWithItems } from "../../src/types"
import * as salesService from "./sales.service"

export function exportSalesToCsv(filePath: string, sales: Sale[]): void {
  const header = "ID;Date;Nombre articles;Total"
  const lines = sales.map(
    (s) => `${s.id};${s.created_at};${s.items_count};${s.total}`,
  )
  fs.writeFileSync(filePath, header + "\n" + lines.join("\n"), "utf-8")
}

export async function exportSalesToPdf(
  filePath: string,
  sales: Sale[],
): Promise<void> {
  const details: SaleWithItems[] = []
  for (const sale of sales) {
    const d = salesService.get(sale.id)
    if (d) details.push(d)
  }

  const html = buildReceiptHtml(details)
  const pdfWin = new BrowserWindow({ show: false, width: 800, height: 600 })

  const tmpHtml = path.join(app.getPath("temp"), "receipt.html")
  fs.writeFileSync(tmpHtml, html, "utf-8")
  await pdfWin.loadFile(tmpHtml)

  const pdfBuffer = await pdfWin.webContents.printToPDF({
    printBackground: true,
    pageSize: "A4",
    margins: { marginType: "default" },
  })

  fs.writeFileSync(filePath, pdfBuffer)
  pdfWin.destroy()
}

function buildReceiptHtml(sales: SaleWithItems[]): string {
  const rows = sales
    .map((sale) => {
      const itemRows = sale.items
        .map(
          (i) => `
        <tr>
          <td style="padding:4px 8px">${i.product_name}</td>
          <td style="padding:4px 8px;text-align:center">${i.quantity}</td>
          <td style="padding:4px 8px;text-align:right">${i.unit_price.toFixed(2)} €</td>
          <td style="padding:4px 8px;text-align:right">${i.total.toFixed(2)} €</td>
        </tr>`,
        )
        .join("")

      return `
      <div style="margin-bottom:24px;border:1px solid #ddd;border-radius:8px;overflow:hidden">
        <div style="background:#f5f5f5;padding:8px 12px;font-weight:bold;display:flex;justify-content:space-between">
          <span>Ticket #${sale.id}</span>
          <span>${new Date(sale.created_at).toLocaleString("fr-FR")}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:#fafafa;border-bottom:1px solid #eee">
            <th style="padding:4px 8px;text-align:left">Produit</th>
            <th style="padding:4px 8px;text-align:center">Qté</th>
            <th style="padding:4px 8px;text-align:right">P.U.</th>
            <th style="padding:4px 8px;text-align:right">Total</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="padding:8px 12px;text-align:right;font-weight:bold;font-size:15px;border-top:1px solid #eee">
          Total : ${sale.total.toFixed(2)} €
        </div>
      </div>`
    })
    .join("")

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>body{font-family:Arial,sans-serif;padding:20px;color:#333}h1{font-size:20px;margin-bottom:16px}</style>
</head><body>
<h1>Rapport de ventes</h1>
${rows}
</body></html>`
}

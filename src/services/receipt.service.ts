import { BrowserWindow, app, dialog, shell } from "electron"
import fs from "node:fs"
import path from "node:path"

import type { SaleWithItems } from "../../src/types/sale.types"
import * as salesService from "./sales.service"

type GetWin = () => BrowserWindow | null

const loadReceiptWindow = async (
  sale: SaleWithItems,
): Promise<BrowserWindow> => {
  const html = buildTicketHtml(sale)
  const receiptWin = new BrowserWindow({ show: false, width: 595, height: 842 })
  const tmpHtml = path.join(app.getPath("temp"), `receipt-${sale.id}.html`)
  fs.writeFileSync(tmpHtml, html, "utf-8")
  await receiptWin.loadFile(tmpHtml)
  return receiptWin
}

export const printReceipt = async (saleId: number): Promise<boolean> => {
  const sale = salesService.get(saleId)
  if (!sale) return false

  const receiptWin = await loadReceiptWindow(sale)

  return new Promise((resolve) => {
    receiptWin.webContents.print(
      { silent: false, printBackground: true },
      (success) => {
        receiptWin.destroy()
        resolve(success)
      },
    )
  })
}

export const downloadReceipt = async (
  saleId: number,
  getWin: GetWin,
): Promise<string | null> => {
  const sale = salesService.get(saleId)
  if (!sale) return null

  const parentWin = getWin()
  const { canceled, filePath } = await dialog.showSaveDialog(parentWin!, {
    defaultPath: `ticket-${saleId}.pdf`,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  })
  if (canceled || !filePath) return null

  const receiptWin = await loadReceiptWindow(sale)

  const pdfBuffer = await receiptWin.webContents.printToPDF({
    printBackground: true,
    pageSize: "A4",
    margins: { marginType: "default" },
  })

  fs.writeFileSync(filePath, pdfBuffer)
  receiptWin.destroy()
  shell.openPath(filePath)
  return filePath
}

const buildTicketHtml = (sale: SaleWithItems): string => {
  const itemRows = sale.items
    .map(
      (i) => `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid #eee">${i.product_name}</td>
      <td style="padding:6px 8px;text-align:center;border-bottom:1px solid #eee">${i.quantity}</td>
      <td style="padding:6px 0;text-align:right;border-bottom:1px solid #eee">${i.unit_price.toFixed(2)} €</td>
      <td style="padding:6px 0;text-align:right;border-bottom:1px solid #eee;font-weight:600">${i.total.toFixed(2)} €</td>
    </tr>`,
    )
    .join("")

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #111; padding: 40px; max-width: 500px; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 24px; }
  .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .header p { font-size: 12px; color: #666; }
  .sep { border-top: 2px solid #111; margin: 16px 0; }
  .sep-light { border-top: 1px dashed #ccc; margin: 12px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 0; border-bottom: 2px solid #111; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
  th:nth-child(2) { text-align: center; }
  th:nth-child(3), th:nth-child(4) { text-align: right; }
  .total-section { margin-top: 16px; text-align: right; }
  .total-section .label { font-size: 14px; color: #555; }
  .total-section .amount { font-size: 28px; font-weight: 800; }
  .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #888; }
  .meta { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 16px; }
</style>
</head><body>
  <div class="header">
    <h1>Épicerie</h1>
    <p>Ticket de caisse</p>
  </div>

  <div class="meta">
    <span>Ticket #${sale.id}</span>
    <span>${new Date(sale.created_at).toLocaleString("fr-FR")}</span>
  </div>

  <div class="sep"></div>

  <table>
    <thead><tr>
      <th>Article</th>
      <th>Qté</th>
      <th>P.U.</th>
      <th>Total</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="sep"></div>

  <div class="total-section">
    <div class="label">${sale.items_count} article(s)</div>
    <div class="amount">${sale.total.toFixed(2)} €</div>
  </div>

  <div class="sep-light"></div>

  <div class="footer">
    Merci de votre visite !
  </div>
</body></html>`
}

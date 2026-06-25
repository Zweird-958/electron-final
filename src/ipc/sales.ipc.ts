import { dialog, ipcMain, shell } from "electron"

import type { Sale } from "../../src/types"
import { SALES } from "../channels"
import * as exportService from "../services/export.service"
import * as salesService from "../services/sales.service"

type GetWin = () => Electron.BrowserWindow | null

export function register(getWin: GetWin) {
  ipcMain.handle(SALES.CREATE, (_e, input) => {
    return salesService.create(input)
  })

  ipcMain.handle(SALES.LIST, () => {
    return salesService.list()
  })

  ipcMain.handle(SALES.GET, (_e, id: number) => {
    return salesService.get(id)
  })

  ipcMain.handle(SALES.GET_BY_DATE, (_e, date: string) => {
    return salesService.listByDate(date)
  })

  ipcMain.handle(SALES.DAILY_SUMMARY, (_e, date: string) => {
    return salesService.dailySummary(date)
  })

  ipcMain.handle(SALES.EXPORT_CSV, async (_e, sales: Sale[]) => {
    const win = getWin()
    if (!win) return null

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      defaultPath: "ventes.csv",
      filters: [{ name: "CSV", extensions: ["csv"] }],
    })
    if (canceled || !filePath) return null

    exportService.exportSalesToCsv(filePath, sales)
    shell.showItemInFolder(filePath)
    return filePath
  })

  ipcMain.handle(SALES.EXPORT_PDF, async (_e, sales: Sale[]) => {
    const win = getWin()
    if (!win) return null

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      defaultPath: "ventes.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    })
    if (canceled || !filePath) return null

    await exportService.exportSalesToPdf(filePath, sales)
    shell.showItemInFolder(filePath)
    return filePath
  })
}

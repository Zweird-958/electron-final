import { ipcMain } from 'electron'
import { RECEIPT } from '../channels/receipt.channels'
import * as receiptService from '../services/receipt.service'

type GetWin = () => Electron.BrowserWindow | null

export const register = (getWin: GetWin) => {
  ipcMain.handle(RECEIPT.PRINT, async (_e, saleId: number) => {
    return receiptService.printReceipt(saleId)
  })

  ipcMain.handle(RECEIPT.DOWNLOAD, async (_e, saleId: number) => {
    return receiptService.downloadReceipt(saleId, getWin)
  })
}

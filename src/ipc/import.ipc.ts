import { ipcMain, dialog } from 'electron'
import { IMPORT } from '../channels/import.channels'
import * as importService from '../services/import.service'

type GetWin = () => Electron.BrowserWindow | null

export const register = (getWin: GetWin) => {
  ipcMain.handle(IMPORT.CSV, async () => {
    const win = getWin()
    if (!win) return null

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'CSV', extensions: ['csv', 'txt'] },
        { name: 'Tous', extensions: ['*'] },
      ],
    })

    if (canceled || !filePaths[0]) return null

    const result = importService.importCsv(filePaths[0], (progress) => {
      win.webContents.send(IMPORT.PROGRESS, progress)
    })

    return result
  })
}

import { ipcMain, dialog, Notification } from 'electron'
import { SYSTEM } from '../channels'

type GetWin = () => Electron.BrowserWindow | null

export function register(getWin: GetWin) {
  ipcMain.handle(SYSTEM.CONFIRM, async (_e, message: string) => {
    const win = getWin()
    const options: Electron.MessageBoxOptions = {
      type: 'warning',
      buttons: ['Annuler', 'Confirmer'],
      defaultId: 1,
      cancelId: 0,
      message,
      noLink: true,
    }

    const { response } = win
      ? await dialog.showMessageBox(win, options)
      : await dialog.showMessageBox(options)

    return response === 1
  })

  ipcMain.handle(SYSTEM.NOTIFY, (_e, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })
}

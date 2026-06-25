import { ipcMain } from "electron"
import pkg from "electron-updater"

import { UPDATER } from "../channels/updater.channels"
import log from "../services/logger"

const { autoUpdater } = pkg

type GetWin = () => Electron.BrowserWindow | null

export const register = (getWin: GetWin) => {
  autoUpdater.logger = {
    info: log.info,
    warn: log.warn,
    error: log.error,
    debug: log.info,
  }
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  const sendStatus = (status: string, info?: unknown) => {
    const win = getWin()
    if (win) win.webContents.send(UPDATER.STATUS, { status, info })
  }

  autoUpdater.on("checking-for-update", () => sendStatus("checking"))
  autoUpdater.on("update-available", (info) => sendStatus("available", info))
  autoUpdater.on("update-not-available", () => sendStatus("up-to-date"))
  autoUpdater.on("download-progress", (progress) =>
    sendStatus("downloading", progress),
  )
  autoUpdater.on("update-downloaded", () => sendStatus("ready"))
  autoUpdater.on("error", (err) => sendStatus("error", err.message))

  ipcMain.handle(UPDATER.CHECK, async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return result?.updateInfo ?? null
    } catch {
      return null
    }
  })

  ipcMain.handle(UPDATER.DOWNLOAD, async () => {
    try {
      await autoUpdater.downloadUpdate()
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(UPDATER.INSTALL, () => {
    autoUpdater.quitAndInstall()
  })
}

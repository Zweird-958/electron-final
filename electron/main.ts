import { app, BrowserWindow, Menu, Tray, nativeImage, globalShortcut, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import log from './services/logger'
import { registerAllHandlers } from './ipc'
import * as settingsService from './services/settings.service'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null
let tray: Tray | null = null
let isQuiting = false

// ─── Single instance lock ─────────────────────────────────
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }
  })

  app.whenReady().then(start)
}

function start() {
  app.setAppUserModelId('com.epicerie.caisse')
  registerAllHandlers(() => win)
  createWindow()
  createMenu()
  createTray()
  log.info('Caisse app started — v' + app.getVersion())
}

// ─── Window ───────────────────────────────────────────────
function createWindow() {
  const settings = settingsService.get()
  const wConf = settings.window

  win = new BrowserWindow({
    width: wConf.width,
    height: wConf.height,
    x: wConf.x,
    y: wConf.y,
    minWidth: 900,
    minHeight: 600,
    title: 'Caisse — Épicerie',
    icon: path.join(process.env.VITE_PUBLIC!, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  if (wConf.maximized) win.maximize()

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('close', (ev) => {
    if (win) {
      const b = win.getBounds()
      settingsService.set({
        window: {
          width: b.width,
          height: b.height,
          x: b.x,
          y: b.y,
          maximized: win.isMaximized(),
        },
      })
    }

    if (!isQuiting) {
      ev.preventDefault()
      win?.hide()
    }
  })
}

// ─── Menu ─────────────────────────────────────────────────
function createMenu() {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: 'appMenu' as const }] : []),
    {
      label: 'Caisse',
      submenu: [
        {
          label: 'Nouvelle vente',
          accelerator: 'CmdOrCtrl+N',
          click: () => win?.webContents.send('menu:new-sale'),
        },
        { type: 'separator' as const },
        ...(!isMac ? [{
          label: 'Quitter',
          accelerator: 'CmdOrCtrl+Q',
          click: () => { isQuiting = true; app.quit() },
        }] : []),
      ],
    },
    { role: 'editMenu' as const },
    { role: 'viewMenu' as const },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ─── Tray ─────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(process.env.VITE_PUBLIC!, 'icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('Caisse — Épicerie')

  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Ouvrir', click: () => { win?.show(); win?.focus() } },
      { type: 'separator' },
      { label: 'Quitter', click: () => { isQuiting = true; app.quit() } },
    ])
  )

  tray.on('click', () => {
    if (win?.isVisible()) win.hide()
    else { win?.show(); win?.focus() }
  })
}

// ─── Error handlers ───────────────────────────────────────
process.on('uncaughtException', (err) => log.error('uncaughtException', err))
process.on('unhandledRejection', (r) => log.error('unhandledRejection', r))

app.on('before-quit', () => { isQuiting = true })
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  if (tray) tray.destroy()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  Tray,
  app,
  globalShortcut,
  nativeImage,
  shell,
} from "electron"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { MENU } from "../src/channels"
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
} from "../src/constants/main.constants"
import { registerAllHandlers } from "../src/ipc"
import log from "../src/services/logger"
import * as settingsService from "../src/services/settings.service"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, "..")

const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"]
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist")

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST

let win: BrowserWindow | null = null
let tray: Tray | null = null

const createWindow = () => {
  const settings = settingsService.get()
  const wConf = settings.window

  win = new BrowserWindow({
    width: wConf.width,
    height: wConf.height,
    x: wConf.x,
    y: wConf.y,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    title: "Caisse — Épicerie",
    icon: path.join(process.env.VITE_PUBLIC!, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (wConf.maximized) {
    win.maximize()
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    if (!app.isPackaged) {
      win.webContents.openDevTools({ mode: "detach" })
    }
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"))
  }

  win.on("close", () => {
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
  })
}

const createTray = () => {
  const iconPath = path.join(process.env.VITE_PUBLIC!, "icon.png")
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(
    icon.isEmpty()
      ? nativeImage.createEmpty()
      : icon.resize({ width: 16, height: 16 }),
  )
  tray.setToolTip("Caisse — Épicerie")

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Ouvrir",
        click: () => {
          win?.show()
          win?.focus()
        },
      },
      { type: "separator" },
      {
        label: "Quitter",
        click: () => {
          app.quit()
        },
      },
    ]),
  )

  tray.on("click", () => {
    if (win?.isVisible()) win.hide()
    else {
      win?.show()
      win?.focus()
    }
  })
}

const labels: Record<string, Record<string, string>> = {
  en: {
    addProduct: "Add product",
  },
  fr: {
    addProduct: "Ajouter un produit",
  },
}

const createMenu = () => {
  const isMac = process.platform === "darwin"
  const lang = settingsService.get().language
  const t = labels[lang] ?? labels.en

  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: "appMenu" as const }] : []),
    {
      label: "Caisse",
      submenu: [
        {
          label: t.addProduct,
          accelerator: "CmdOrCtrl+Shift+N",
          click: () => win?.webContents.send(MENU.ADD_PRODUCT),
        },
      ],
    },
    { role: "editMenu" as const },
    { role: "viewMenu" as const },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }
  })

  app.whenReady().then(start)
}

function start() {
  registerAllHandlers(() => win)
  createWindow()
  createMenu()
  createTray()
  log.info("Caisse app started — v" + app.getVersion())
}

process.on("uncaughtException", (err) => log.error("uncaughtException", err))
process.on("unhandledRejection", (r) => log.error("unhandledRejection", r))

app.on("will-quit", () => {
  globalShortcut.unregisterAll()
  if (tray) {
    tray.destroy()
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
    win = null
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

import { register as registerProducts } from './products.ipc'
import { register as registerSales } from './sales.ipc'
import { register as registerSettings } from './settings.ipc'
import { register as registerSystem } from './system.ipc'

type GetWin = () => Electron.BrowserWindow | null

export function registerAllHandlers(getWin: GetWin) {
  registerProducts()
  registerSales(getWin)
  registerSettings()
  registerSystem(getWin)
}

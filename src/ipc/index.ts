import { register as registerDashboard } from "./dashboard.ipc"
import { register as registerImport } from "./import.ipc"
import { register as registerProducts } from "./products.ipc"
import { register as registerReceipt } from "./receipt.ipc"
import { register as registerSales } from "./sales.ipc"
import { register as registerSettings } from "./settings.ipc"
import { register as registerSystem } from "./system.ipc"

type GetWin = () => Electron.BrowserWindow | null

export const registerAllHandlers = (getWin: GetWin) => {
  registerProducts()
  registerSales(getWin)
  registerSettings()
  registerSystem(getWin)
  registerImport(getWin)
  registerDashboard()
  registerReceipt(getWin)
}

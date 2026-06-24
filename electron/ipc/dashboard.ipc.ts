import { ipcMain } from 'electron'
import { DASHBOARD } from '../channels/dashboard.channels'
import * as dashboardService from '../services/dashboard.service'

export const register = () => {
  ipcMain.handle(DASHBOARD.SUMMARY, () => {
    return dashboardService.getSummary()
  })
}

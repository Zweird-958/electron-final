import { ipcMain } from 'electron'
import { SETTINGS } from '../channels'
import * as settingsService from '../services/settings.service'
import type { AppSettings } from '../../src/types'

export function register() {
  ipcMain.handle(SETTINGS.GET, () => {
    return settingsService.get()
  })

  ipcMain.handle(SETTINGS.SET, (_e, partial: Partial<AppSettings>) => {
    return settingsService.set(partial)
  })
}

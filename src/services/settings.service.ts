import Store from 'electron-store'
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_MAXIMIZED,
  LANGUAGE_STORE_KEY,
  THEME_STORE_KEY,
  WINDOW_STORE_KEY,
} from '../constants/settings.constants'
import type { AppSettings } from '../../src/types/settings.types'

const store = new Store<AppSettings>({
  defaults: {
    [LANGUAGE_STORE_KEY]: DEFAULT_LANGUAGE,
    [THEME_STORE_KEY]: DEFAULT_THEME,
    [WINDOW_STORE_KEY]: {
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
      maximized: DEFAULT_WINDOW_MAXIMIZED,
    },
  },
})

export function get(): AppSettings {
  return {
    language: store.get(LANGUAGE_STORE_KEY),
    theme: store.get(THEME_STORE_KEY),
    window: store.get(WINDOW_STORE_KEY),
  }
}

export function set(partial: Partial<AppSettings>): AppSettings {
  for (const [key, value] of Object.entries(partial)) {
    store.set(key as keyof AppSettings, value)
  }
  return get()
}

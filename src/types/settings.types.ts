export type AppSettings = {
  language: 'fr' | 'en'
  theme: 'light' | 'dark' | 'system'
  window: {
    width: number
    height: number
    x?: number
    y?: number
    maximized: boolean
  }
}

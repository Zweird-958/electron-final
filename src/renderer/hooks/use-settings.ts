import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AppSettings } from '@/types'

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    api.settings.get().then(setSettings)
  }, [])

  const update = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = await api.settings.set(partial)
    setSettings(updated)
    return updated
  }, [])

  return { settings, update }
}

import { useEffect, useState } from 'react'
import { RefreshCw, Download, RotateCcw, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { toast } from 'sonner'

type UpdateStatus = 'idle' | 'checking' | 'available' | 'up-to-date' | 'downloading' | 'ready' | 'error'

export const SettingsPage = () => {
  const { t, i18n } = useTranslation()
  const { settings, update } = useSettings()
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')

  useEffect(() => {
    if (settings) {
      i18n.changeLanguage(settings.language)
      applyTheme(settings.theme)
    }
  }, [settings, i18n])

  useEffect(() => {
    const handler = (...args: unknown[]) => {
      const data = args[0] as { status: string }
      setUpdateStatus(data.status as UpdateStatus)
    }
    api.on('updater:status', handler)
    return () => api.off('updater:status', handler)
  }, [])

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    root.classList.remove('dark')
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    }
  }

  const handleLanguageChange = async (value: string | null) => {
    if (!value) return
    const language = value as 'fr' | 'en'
    await i18n.changeLanguage(language)
    await update({ language })
    toast.success(t('settings.saved'))
  }

  const handleThemeChange = async (value: string | null) => {
    if (!value) return
    const theme = value as 'light' | 'dark' | 'system'
    applyTheme(theme)
    await update({ theme })
    toast.success(t('settings.saved'))
  }

  const handleCheckUpdates = async () => {
    setUpdateStatus('checking')
    await api.updater.check()
  }

  const handleDownload = async () => {
    setUpdateStatus('downloading')
    await api.updater.download()
  }

  const handleInstall = () => {
    api.updater.install()
  }

  const languageLabels: Record<string, string> = {
    fr: 'Français',
    en: 'English',
  }

  const themeLabels: Record<string, string> = {
    light: t('settings.themeLight'),
    dark: t('settings.themeDark'),
    system: t('settings.themeSystem'),
  }

  if (!settings) return null

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-lg font-bold">{t('settings.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={settings.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-48">
              {languageLabels[settings.language]}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.theme')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={settings.theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-48">
              {themeLabels[settings.theme]}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
              <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
              <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.updates')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {updateStatus === 'idle' && (
            <Button variant="outline" onClick={handleCheckUpdates}>
              <RefreshCw className="size-4" />
              {t('settings.checkUpdates')}
            </Button>
          )}

          {updateStatus === 'checking' && (
            <Button variant="outline" disabled>
              <Loader2 className="size-4 animate-spin" />
              {t('settings.checkUpdates')}
            </Button>
          )}

          {updateStatus === 'up-to-date' && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="size-4" />
              {t('settings.upToDate')}
            </div>
          )}

          {updateStatus === 'available' && (
            <Button onClick={handleDownload}>
              <Download className="size-4" />
              {t('settings.updateAvailable')}
            </Button>
          )}

          {updateStatus === 'downloading' && (
            <Button disabled>
              <Loader2 className="size-4 animate-spin" />
              {t('settings.downloading')}
            </Button>
          )}

          {updateStatus === 'ready' && (
            <Button onClick={handleInstall}>
              <RotateCcw className="size-4" />
              {t('settings.restartToUpdate')}
            </Button>
          )}

          {updateStatus === 'error' && (
            <div className="space-y-2">
              <p className="text-sm text-destructive">{t('common.error')}</p>
              <Button variant="outline" onClick={handleCheckUpdates}>
                <RefreshCw className="size-4" />
                {t('settings.checkUpdates')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useSettings } from '@/hooks/use-settings'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const SettingsPage = () => {
  const { t, i18n } = useTranslation()
  const { settings, update } = useSettings()

  useEffect(() => {
    if (settings) {
      i18n.changeLanguage(settings.language)
      applyTheme(settings.theme)
    }
  }, [settings, i18n])

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
    </div>
  )
}

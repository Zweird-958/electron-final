import { useEffect, useState } from 'react'
import { RefreshCw, Download, RotateCcw, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'

type UpdateStatus = 'idle' | 'checking' | 'available' | 'up-to-date' | 'downloading' | 'ready' | 'error'

export const UpdaterCard = () => {
  const { t } = useTranslation()
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')

  useEffect(() => {
    const handler = (...args: unknown[]) => {
      const data = args[0] as { status: string }
      setUpdateStatus(data.status as UpdateStatus)
    }
    api.on('updater:status', handler)
    return () => api.off('updater:status', handler)
  }, [])

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

  return (
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
  )
}

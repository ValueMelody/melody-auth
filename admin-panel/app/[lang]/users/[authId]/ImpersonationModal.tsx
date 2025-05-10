import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useAuth } from '@melody-auth/react'
import {
  AlertDialog, AlertDialogCancel, AlertDialogFooter,
  AlertDialogTitle, AlertDialogHeader, AlertDialogContent,
  AlertDialogDescription,
} from 'components/ui/alert-dialog'
import {
  UserDetail, useGetApiV1AppsQuery,
  useGetApiV1UsersByAuthIdConsentedAppsQuery,
  usePostApiV1UsersByAuthIdImpersonationAndAppIdMutation,
} from 'services/auth/api'
import { typeTool } from 'tools'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem,
} from 'components/ui/select'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'
import { Button } from '@/components/ui/button'

const ImpersonationModal = ({
  show,
  user,
  onClose,
}: {
  show: boolean;
  user: UserDetail;
  onClose: () => void;
}) => {
  const t = useTranslations('users')

  const { data } = useGetApiV1AppsQuery()
  const configs = useSignalValue(configSignal)

  const enableConsent = !!configs.ENABLE_USER_APP_CONSENT
  const { data: consentsData } = useGetApiV1UsersByAuthIdConsentedAppsQuery(
    { authId: String(user.authId) },
    { skip: !enableConsent },
  )
  const consentedApps = consentsData?.consentedApps ?? []

  const { accessToken } = useAuth()

  const [impersonate] = usePostApiV1UsersByAuthIdImpersonationAndAppIdMutation()

  const apps = data?.apps?.filter((app) => app.type === typeTool.ClientType.SPA && app.isActive) ?? []

  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)

  const [refreshTokenStorage, setRefreshTokenStorage] = useState<{
    refreshToken: string;
    expiresOn: number;
    expiresIn: number;
  } | null>(null)
  const selectedApp = apps.find((app) => app.id === selectedAppId)
  const isConsented = !enableConsent || consentedApps.some((app) => app.appId === selectedAppId)

  const handleAppChange = async (appId: string) => {
    setRefreshTokenStorage(null)
    setSelectedAppId(parseInt(appId))
  }

  const handleImpersonate = async () => {
    if (!selectedAppId) return
    const res = await impersonate({
      authId: user.authId,
      appId: selectedAppId,
      body: { impersonatorToken: accessToken ?? '' },
    })
    if (res.data?.refresh_token && res.data.refresh_token_expires_on && res.data.refresh_token_expires_in) {
      setRefreshTokenStorage({
        refreshToken: res.data.refresh_token,
        expiresOn: res.data.refresh_token_expires_on,
        expiresIn: res.data.refresh_token_expires_in,
      })
    }
  }

  return (
    <AlertDialog open={show}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(
            'impersonateTitle',
            { user: user.email },
          )}</AlertDialogTitle>
        </AlertDialogHeader>
        <section>
          <div className='flex items-center gap-2'>
            <AlertDialogDescription>{t('impersonateApp')}</AlertDialogDescription>
            <Select
              value={selectedAppId?.toString()}
              onValueChange={handleAppChange}
            >
              <SelectTrigger data-testid='appSelect'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {apps.map((app) => (
                    <SelectItem
                      key={app.id}
                      value={app.id.toString()}
                      data-testid={`appSelectItem-${app.id}`}
                    >
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {!isConsented && selectedApp && (
            <p className='mt-4 text-red-500'>{t('impersonateConsent')}</p>
          )}
          {isConsented && !refreshTokenStorage && selectedApp && (
            <Button
              className='mt-4'
              onClick={handleImpersonate}
              data-testid='confirmImpersonate'
            >
              {t('confirmImpersonate')}
            </Button>
          )}
          {refreshTokenStorage && (
            <div className='mt-6'>
              <p
                className='font-bold'
                data-testid='impersonateToken'>{t('impersonateToken')}:</p>
              <p className='break-all mt-2'>{refreshTokenStorage.refreshToken}</p>
              <p className='text-sm text-gray-500 mt-4'>{t('impersonateTokenDesc')}</p>
              <p className='font-bold mt-6'>{t('impersonateDirect')}:</p>
              <div className='flex flex-col gap-2 mt-2'>
                {selectedApp?.redirectUris.map((uri) => (
                  <a
                    key={uri}
                    href={`${uri}?refresh_token=${refreshTokenStorage.refreshToken}&refresh_token_expires_on=${refreshTokenStorage.expiresOn}&refresh_token_expires_in=${refreshTokenStorage.expiresIn}`}
                    target='_blank'
                    rel='noreferrer'
                    className='break-all text-blue-500'>
                    {uri}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('closeImpersonate')}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ImpersonationModal

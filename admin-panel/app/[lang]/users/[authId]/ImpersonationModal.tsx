import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useAuth } from '@melody-auth/react'
import {
  AlertDialog, AlertDialogCancel, AlertDialogFooter,
  AlertDialogTitle, AlertDialogHeader, AlertDialogContent,
  AlertDialogDescription,
} from 'components/ui/alert-dialog'
import {
  UserDetail, useGetApiV1AppsQuery, usePostApiV1UsersByAuthIdImpersonationAndAppIdMutation,
} from 'services/auth/api'
import { typeTool } from 'tools'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem,
} from 'components/ui/select'
import { Label } from 'components/ui/label'

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

  const handleAppChange = async (appId: string) => {
    setRefreshTokenStorage(null)
    setSelectedAppId(parseInt(appId))
    const res = await impersonate({
      authId: user.authId,
      appId: parseInt(appId),
      body: { impersonatorToken: accessToken ?? '' },
    })
    if (res.data?.refresh_token) {
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
        <AlertDialogDescription>
          <div className='flex items-center gap-2'>
            <Label>{t('impersonateApp')}</Label>
            <Select
              value={selectedAppId?.toString()}
              onValueChange={handleAppChange}
            >
              <SelectTrigger data-testid='typeSelect'>
                <SelectValue data-testid='typeSelectValue' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {apps.map((app) => (
                    <SelectItem
                      key={app.id}
                      value={app.id.toString()}
                    >
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {refreshTokenStorage && (
            <div className='mt-6'>
              <p className='font-bold'>{t('impersonateToken')}:</p>
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
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('closeImpersonate')}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ImpersonationModal

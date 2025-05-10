'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useMemo, useState,
} from 'react'
import {
  EyeIcon, EyeSlashIcon,
} from '@heroicons/react/16/solid'
import { useAuth } from '@melody-auth/react'
import RedirectUriEditor from '../RedirectUriEditor'
import useEditApp from '../useEditApp'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { Switch } from 'components/ui/switch'
import {
  routeTool, typeTool, accessTool,
} from 'tools'
import ClientTypeLabel from 'components/ClientTypeLabel'
import SubmitError from 'components/SubmitError'
import FieldError from 'components/FieldError'
import ScopesEditor from 'components/ScopesEditor'
import SaveButton from 'components/SaveButton'
import DeleteButton from 'components/DeleteButton'
import { useRouter } from 'i18n/navigation'
import {
  useDeleteApiV1AppsByIdMutation, useGetApiV1AppsByIdQuery, useGetApiV1ScopesQuery, usePutApiV1AppsByIdMutation,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
import { Label } from 'components/ui/label'

const Page = () => {
  const { id } = useParams()
  const router = useRouter()

  const t = useTranslations()

  const {
    data: appData, isLoading: isAppLoading,
  } = useGetApiV1AppsByIdQuery({ id: Number(id) })
  const app = appData?.app

  const { data: scopesData } = useGetApiV1ScopesQuery()
  const scopes = scopesData?.scopes ?? []
  const availableScopes = scopes.filter((scope) => scope.type === app?.type)

  const [showSecret, setShowSecret] = useState(false)

  const [updateApp, { isLoading: isUpdating }] = usePutApiV1AppsByIdMutation()
  const [deleteApp, { isLoading: isDeleting }] = useDeleteApiV1AppsByIdMutation()

  const { userInfo } = useAuth()
  const canWriteApp = accessTool.isAllowedAccess(
    accessTool.Access.WriteApp,
    userInfo?.roles,
  )

  const {
    values, errors, onChange,
  } = useEditApp(app)

  const updateObj = useMemo(
    () => {
      if (!app) return {}
      type Key = 'name' | 'scopes' | 'redirectUris' | 'isActive' | 'useSystemMfaConfig' | 'requireEmailMfa' | 'requireOtpMfa' | 'requireSmsMfa' | 'allowEmailMfaAsBackup'
      const updateKeys = ['name', 'scopes', 'redirectUris', 'isActive', 'useSystemMfaConfig', 'requireEmailMfa', 'requireOtpMfa', 'requireSmsMfa', 'allowEmailMfaAsBackup'].filter((key) => values[key as Key] !== app[key as Key])
      return updateKeys.reduce(
        (
          obj, key,
        ) => ({
          ...obj,
          [key]: values[key as Key],
        }),
        {},
      )
    },
    [app, values],
  )

  const toggleSecret = () => {
    setShowSecret(!showSecret)
  }

  const handleDelete = async () => {
    await deleteApp({ id: Number(id) })

    router.push(routeTool.Internal.Apps)
  }

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      return
    }

    await updateApp({
      id: Number(id),
      putAppReq: updateObj,
    })
  }

  const handleToggleAppScope = (scope: string) => {
    const newScopes = values.scopes.includes(scope)
      ? values.scopes.filter((currentScope) => currentScope !== scope)
      : [...values.scopes, scope]
    onChange(
      'scopes',
      newScopes,
    )
  }

  if (isAppLoading) return <LoadingPage />

  if (!app) return null

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('apps.app') }}
        parent={{
          href: routeTool.Internal.Apps,
          label: t('apps.title'),
        }}
      />
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='max-md:w-24 md:w-48'>{t('common.property')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y break-all'>
            <TableRow>
              <TableCell>{t('apps.name')}</TableCell>
              <TableCell>
                <Input
                  disabled={!canWriteApp}
                  data-testid='nameInput'
                  onChange={(e) => onChange(
                    'name',
                    e.target.value,
                  )}
                  value={values.name}
                />
                <FieldError error={errors.name} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('apps.clientId')}</TableCell>
              <TableCell>{app.clientId}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('apps.clientSecret')}</TableCell>
              <TableCell className='break-all'>
                <div className='flex items-center gap-4'>
                  {showSecret ? app.secret : '*****'}
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={toggleSecret}>
                    {showSecret ? <EyeSlashIcon className='w-4 h-4' /> : <EyeIcon className='w-4 h-4' />}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('apps.status')}</TableCell>
              <TableCell>
                <Switch
                  data-testid='statusInput'
                  checked={values.isActive}
                  disabled={!canWriteApp}
                  onClick={() => onChange(
                    'isActive',
                    !values.isActive,
                  )}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('apps.type')}</TableCell>
              <TableCell>
                <ClientTypeLabel type={app.type} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('apps.scopes')}</TableCell>
              <TableCell>
                <ScopesEditor
                  disabled={!canWriteApp}
                  scopes={availableScopes}
                  value={values.scopes}
                  onToggleScope={handleToggleAppScope}
                />
              </TableCell>
            </TableRow>
            {app.type === typeTool.ClientType.SPA && (
              <TableRow>
                <TableCell>{t('apps.redirectUris')}</TableCell>
                <TableCell>
                  <RedirectUriEditor
                    disabled={!canWriteApp}
                    redirectUris={values.redirectUris}
                    onChange={(uris) => onChange(
                      'redirectUris',
                      uris,
                    )}
                  />
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>{t('apps.appLevelMfa')}</TableCell>
              <TableCell className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <Switch
                    id='mfa-useSystem'
                    data-testid='mfa-useSystem'
                    checked={values.useSystemMfaConfig}
                    disabled={!canWriteApp}
                    onClick={() => onChange(
                      'useSystemMfaConfig',
                      !values.useSystemMfaConfig,
                    )}
                  />
                  <Label
                    htmlFor='mfa-useSystem'
                    className='flex'
                  >
                    {t('apps.useSystemMfaConfig')}
                  </Label>
                </div>
                {!values.useSystemMfaConfig && (
                  <>
                    <p className='text-sm'>{t('apps.appLevelMfaDescription')}</p>
                    <div className='flex items-center gap-2'>
                      <Switch
                        id='mfa-requireEmail'
                        data-testid='mfa-requireEmail'
                        checked={values.requireEmailMfa}
                        disabled={!canWriteApp}
                        onClick={() => onChange(
                          'requireEmailMfa',
                          !values.requireEmailMfa,
                        )}
                      />
                      <Label
                        htmlFor='mfa-requireEmail'
                        className='flex'
                      >
                        {t('apps.requireEmailMfa')}
                      </Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Switch
                        id='mfa-requireOtp'
                        data-testid='mfa-requireOtp'
                        checked={values.requireOtpMfa}
                        disabled={!canWriteApp}
                        onClick={() => onChange(
                          'requireOtpMfa',
                          !values.requireOtpMfa,
                        )}
                      />
                      <Label
                        htmlFor='mfa-requireOtp'
                        className='flex'
                      >
                        {t('apps.requireOtpMfa')}
                      </Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Switch
                        id='mfa-requireSms'
                        data-testid='mfa-requireSms'
                        checked={values.requireSmsMfa}
                        disabled={!canWriteApp}
                        onClick={() => onChange(
                          'requireSmsMfa',
                          !values.requireSmsMfa,
                        )}
                      />
                      <Label
                        htmlFor='mfa-requireSms'
                        className='flex'
                      >
                        {t('apps.requireSmsMfa')}
                      </Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Switch
                        id='mfa-allowEmailMfaAsBackup'
                        data-testid='mfa-allowEmailMfaAsBackup'
                        checked={values.allowEmailMfaAsBackup}
                        disabled={!canWriteApp}
                        onClick={() => onChange(
                          'allowEmailMfaAsBackup',
                          !values.allowEmailMfaAsBackup,
                        )}
                      />
                      <Label
                        htmlFor='mfa-allowEmailMfaAsBackup'
                        className='flex'
                      >
                        {t('apps.allowEmailMfaAsBackup')}
                      </Label>
                    </div>
                  </>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{app.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{app.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
      <SubmitError />
      {canWriteApp && (
        <section className='flex items-center gap-4 mt-8'>
          <SaveButton
            isLoading={isUpdating}
            disabled={!Object.keys(updateObj).length || isDeleting}
            onClick={handleSave}
          />
          <DeleteButton
            isLoading={isDeleting}
            disabled={isUpdating}
            confirmDeleteTitle={t(
              'common.deleteConfirm',
              { item: app.name },
            )}
            onConfirmDelete={handleDelete}
          />
        </section>
      )}
    </section>
  )
}

export default Page

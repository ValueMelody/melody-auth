'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useMemo, useState,
} from 'react'
import { useAuth } from '@melody-auth/react'
import useEditBanner from 'app/[lang]/apps/banners/useEditBanner'
import LocaleEditor from 'components/LocaleEditor'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import {
  routeTool,
  accessTool,
} from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import DeleteButton from 'components/DeleteButton'
import { useRouter } from 'i18n/navigation'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'
import {
  useDeleteApiV1AppBannersByIdMutation,
  usePutApiV1AppBannersByIdMutation,
  useGetApiV1AppBannersByIdQuery,
  useGetApiV1AppsQuery,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
import RequiredProperty from 'components/RequiredProperty'
import BannerTypeSelector from '@/components/BannerTypeSelector'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ClientType } from '@/tools/type'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useRouter()

  const {
    data, isLoading,
  } = useGetApiV1AppBannersByIdQuery({ id: Number(id) })
  const banner = data?.appBanner

  const { data: appsData } = useGetApiV1AppsQuery()

  const apps = appsData?.apps?.filter((app) => app.isActive && app.type === ClientType.SPA) ?? []

  const [updateBanner, { isLoading: isUpdating }] = usePutApiV1AppBannersByIdMutation()
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteApiV1AppBannersByIdMutation()

  const configs = useSignalValue(configSignal)

  const { userInfo } = useAuth()
  const canWriteApp = accessTool.isAllowedAccess(
    accessTool.Access.WriteApp,
    userInfo?.roles,
  )

  const {
    values, errors, onChange,
  } = useEditBanner(banner)
  const [showErrors, setShowErrors] = useState(false)

  const hasDifferentLocales = useMemo(
    () => {
      if (values.locales !== undefined && banner?.locales === undefined) return true
      if (Array.isArray(values.locales) && Array.isArray(banner?.locales)) {
        if (values.locales.length !== banner.locales.length) return true
        if (values.locales.find((valueLocale) => {
          return banner.locales.every((bannerLocale) => {
            return bannerLocale.locale !== valueLocale.locale || bannerLocale.value !== valueLocale.value
          })
        })) return true
      }
      return false
    },
    [values, banner],
  )

  const hasDifferentText = useMemo(
    () => values.text && values.text !== banner?.text,
    [values, banner],
  )

  const hasDifferentType = useMemo(
    () => values.type && values.type !== banner?.type,
    [values, banner],
  )

  const hasDifferentApps = useMemo(
    () => values.appIds.length !== banner?.appIds?.length ||
      values.appIds.some((appId) => !banner?.appIds?.includes(appId)) ||
      banner?.appIds?.some((appId) => !values.appIds?.includes(appId)),
    [values, banner],
  )

  const hasDifferentStatus = useMemo(
    () => values.isActive !== banner?.isActive,
    [values, banner],
  )

  const canUpdate = useMemo(
    () => hasDifferentText || hasDifferentType || hasDifferentLocales || hasDifferentApps || hasDifferentStatus,
    [hasDifferentText, hasDifferentType, hasDifferentLocales, hasDifferentApps, hasDifferentStatus],
  )

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    await updateBanner({
      id: Number(id),
      putAppBannerReq: {
        type: hasDifferentType ? values.type : undefined,
        text: hasDifferentText ? values.text : undefined,
        locales: hasDifferentLocales ? values.locales : undefined,
        appIds: hasDifferentApps ? values.appIds : undefined,
        isActive: hasDifferentStatus ? values.isActive : undefined,
      },
    })
  }

  const handleDelete = async () => {
    await deleteBanner({ id: Number(id) })

    router.push(routeTool.Internal.Apps)
  }

  const handleToggleApp = (appId: number) => {
    const newAppIds = values.appIds?.includes(appId)
      ? values.appIds?.filter((id) => id !== appId)
      : [...(values.appIds ?? []), appId]
    onChange(
      'appIds',
      newAppIds,
    )
  }

  if (isLoading) return <LoadingPage />

  if (!banner) return null

  return (
    <section>
      <Breadcrumb
        page={{ label: banner.text }}
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
          <TableBody className='divide-y'>
            <TableRow>
              <TableCell>{t('apps.bannerType')}</TableCell>
              <TableCell>
                <BannerTypeSelector
                  value={values.type}
                  onChange={(type) => onChange(
                    'type',
                    type,
                  )}
                  disabled={!canWriteApp}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('apps.bannerStatus')}</TableCell>
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
              <TableCell>{t('apps.bannerApps')}</TableCell>
              <TableCell>
                <div className='flex items-center flex-wrap gap-6 max-md:flex-col max-md:items-start'>
                  {apps?.map((app) => (
                    <div
                      key={app.id}
                      className='flex items-center gap-2'>
                      <Checkbox
                        id={`app-${app.id}`}
                        disabled={!canWriteApp}
                        data-testid='appInput'
                        onClick={() => handleToggleApp(app.id)}
                        checked={values.appIds?.includes(app.id) ?? false}
                      />
                      <Label
                        htmlFor={`app-${app.id}`}
                        className='flex'
                      >
                        {app.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <RequiredProperty title={t('apps.bannerText')} />
              </TableCell>
              <TableCell>
                <Input
                  disabled={!canWriteApp}
                  data-testid='textInput'
                  onChange={(e) => onChange(
                    'text',
                    e.target.value,
                  )}
                  value={values.text}
                />
                {showErrors && <FieldError error={errors.text} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('apps.bannerLocales')}</TableCell>
              <TableCell>
                <LocaleEditor
                  description={`* ${t('apps.bannerLocalesNote')}`}
                  supportedLocales={configs.SUPPORTED_LOCALES}
                  values={values.locales ?? []}
                  disabled={!canWriteApp}
                  onChange={(locales) => onChange(
                    'locales',
                    locales,
                  )}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{banner.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{banner.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
      <SubmitError />
      {canWriteApp && (
        <section className='flex items-center gap-4 mt-8'>
          <SaveButton
            isLoading={isUpdating}
            disabled={!canUpdate || isDeleting}
            onClick={handleSave}
          />
          <DeleteButton
            isLoading={isDeleting}
            disabled={isUpdating}
            confirmDeleteTitle={t(
              'common.deleteConfirm',
              { item: values.text },
            )}
            onConfirmDelete={handleDelete}
          />
        </section>
      )}
    </section>
  )
}

export default Page

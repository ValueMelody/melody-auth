'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@melody-auth/react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import EntityStatusLabel from 'components/EntityStatusLabel'
import {
  routeTool, accessTool,
} from 'tools'
import EditLink from 'components/EditLink'
import CreateButton from 'components/CreateButton'
import ClientTypeLabel from 'components/ClientTypeLabel'
import {
  useGetApiV1AppsQuery, useGetApiV1AppBannersQuery,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
import BannerTypeLabel from 'components/BannerTypeLabel'
import { configSignal } from '@/signals'
import useSignalValue from '@/app/useSignalValue'

const Page = () => {
  const t = useTranslations()

  const {
    data, isLoading,
  } = useGetApiV1AppsQuery()

  const { data: appBannersData } = useGetApiV1AppBannersQuery()
  const configs = useSignalValue(configSignal)

  const { userInfo } = useAuth()
  const canWriteApp = accessTool.isAllowedAccess(
    accessTool.Access.WriteApp,
    userInfo?.roles,
  )

  const apps = data?.apps ?? []
  const appBanners = appBannersData?.appBanners ?? []

  if (isLoading) return <LoadingPage />

  return (
    <section>
      <Breadcrumb
        page={{ label: t('apps.title') }}
        action={canWriteApp && (
          <CreateButton
            href={`${routeTool.Internal.Apps}/new`}
          />
        )}
      />
      <Table className='break-all'>
        <TableHeader className='md:hidden'>
          <TableRow>
            <TableHead>{t('apps.app')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableHeader className='max-md:hidden'>
          <TableRow>
            <TableHead>{t('apps.name')}</TableHead>
            <TableHead>{t('apps.clientId')}</TableHead>
            <TableHead>{t('apps.status')}</TableHead>
            <TableHead>{t('apps.type')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className='divide-y md:hidden'>
          {apps.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col gap-2'>
                    {app.name}
                    {app.clientId}
                    <div className='flex items-center gap-2'>
                      <EntityStatusLabel isEnabled={app.isActive} />
                      <ClientTypeLabel type={app.type} />
                    </div>
                  </div>
                  <EditLink
                    href={`${routeTool.Internal.Apps}/${app.id}`}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableBody className='divide-y max-md:hidden'>
          {apps.map((app) => (
            <TableRow
              key={app.id}
              data-testid='appRow'>
              <TableCell>{app.name}</TableCell>
              <TableCell>{app.clientId}</TableCell>
              <TableCell>
                <EntityStatusLabel isEnabled={app.isActive} />
              </TableCell>
              <TableCell>
                <ClientTypeLabel type={app.type} />
              </TableCell>
              <TableCell>
                <EditLink
                  href={`${routeTool.Internal.Apps}/${app.id}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {configs.ENABLE_APP_BANNER && (
        <>
          <Breadcrumb
            className='mt-16'
            page={{ label: t('apps.appBanners') }}
            action={canWriteApp && (
              <CreateButton
                data-testid='createBannerButton'
                href={`${routeTool.Internal.Apps}/banners/new`}
              />
            )}
          />
          <Table className='break-all'>
            <TableHeader className='md:hidden'>
              <TableRow>
                <TableHead>{t('apps.appBanner')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableHeader className='max-md:hidden'>
              <TableRow>
                <TableHead>{t('apps.bannerText')}</TableHead>
                <TableHead>{t('apps.bannerType')}</TableHead>
                <TableHead>{t('apps.bannerStatus')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody className='divide-y md:hidden'>
              {appBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className='flex items-center justify-between'>
                      <div className='flex flex-col gap-2'>
                        {banner.text}
                        <div className='flex items-center gap-2'>
                          <BannerTypeLabel type={banner.type} />
                          <EntityStatusLabel isEnabled={banner.isActive} />
                        </div>
                      </div>
                      {canWriteApp && (
                        <EditLink
                          href={`${routeTool.Internal.Apps}/banners/${banner.id}`}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableBody className='divide-y max-md:hidden'>
              {appBanners.map((banner) => (
                <TableRow
                  key={banner.id}
                  data-testid='bannerRow'>
                  <TableCell>{banner.text}</TableCell>
                  <TableCell>
                    <BannerTypeLabel type={banner.type} />
                  </TableCell>
                  <TableCell>
                    <EntityStatusLabel isEnabled={banner.isActive} />
                  </TableCell>
                  <TableCell>
                    {canWriteApp && (
                      <EditLink
                        href={`${routeTool.Internal.Apps}/banners/${banner.id}`}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </section>
  )
}

export default Page

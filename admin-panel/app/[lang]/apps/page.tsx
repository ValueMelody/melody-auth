'use client'

import { useAuth } from '@melody-auth/react'
import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useEffect, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import EntityStatusLabel from 'components/EntityStatusLabel'
import {
  proxyTool, routeTool,
} from 'tools'
import EditLink from 'components/EditLink'
import PageTitle from 'components/PageTitle'
import CreateButton from 'components/CreateButton'
import ClientTypeLabel from 'components/ClientTypeLabel'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const [apps, setApps] = useState([])
  const { acquireToken } = useAuth()

  useEffect(
    () => {
      const getApps = async () => {
        const token = await acquireToken()
        const data = await proxyTool.sendNextRequest({
          endpoint: '/api/apps',
          method: 'GET',
          token,
        })
        setApps(data.apps)
      }

      getApps()
    },
    [acquireToken],
  )

  return (
    <section>
      <div className='mb-6 flex items-center gap-4'>
        <PageTitle title={t('apps.title')} />
        <CreateButton
          href={`/${locale}${routeTool.Internal.Apps}/new`}
        />
      </div>
      <Table className='break-all'>
        <Table.Head className='md:hidden'>
          <Table.HeadCell>{t('apps.app')}</Table.HeadCell>
        </Table.Head>
        <Table.Head className='max-md:hidden'>
          <Table.HeadCell>{t('apps.name')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.clientId')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.status')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.type')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y md:hidden'>
          {apps.map((app) => (
            <Table.Row key={app.id}>
              <Table.Cell>
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
                    href={`/${locale}/apps/${app.id}`}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Body className='divide-y max-md:hidden'>
          {apps.map((app) => (
            <Table.Row key={app.id}>
              <Table.Cell>{app.name}</Table.Cell>
              <Table.Cell>{app.clientId}</Table.Cell>
              <Table.Cell>
                <EntityStatusLabel isEnabled={app.isActive} />
              </Table.Cell>
              <Table.Cell>
                <ClientTypeLabel type={app.type} />
              </Table.Cell>
              <Table.Cell>
                <EditLink
                  href={`/${locale}/apps/${app.id}`}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page

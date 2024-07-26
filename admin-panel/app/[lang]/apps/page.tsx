'use client'

import { useAuth } from '@melody-auth/react'
import {
  Button, Table,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  useEffect, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import EntityStatusLabel from 'components/EntityStatusLabel'
import {
  proxyTool, routeTool,
} from 'tools'
import EditLink from 'components/EditLink'

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
      <div className='mb-6 flex'>
        <Button
          as={Link}
          href={`/${locale}${routeTool.Internal.Apps}/new`}
          size='sm'>{t('common.create')}
        </Button>
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>{t('apps.clientId')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.name')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.status')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.type')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y'>
          {apps.map((app) => (
            <Table.Row key={app.id}>
              <Table.Cell>{app.id}</Table.Cell>
              <Table.Cell>{app.name}</Table.Cell>
              <Table.Cell>
                <EntityStatusLabel isEnabled={!app.deletedAt} />
              </Table.Cell>
              <Table.Cell>
                {app.type.toUpperCase()}
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

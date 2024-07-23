'use client'

import { PencilSquareIcon } from '@heroicons/react/16/solid'
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
import EntityStatus from 'components/EntityStatus'
import { proxyTool } from 'tools'
import AppScopes from 'components/AppScopes'

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
      <Table>
        <Table.Head>
          <Table.HeadCell>{t('apps.clientId')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.name')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.status')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.type')}</Table.HeadCell>
          <Table.HeadCell>{t('apps.scopes')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y'>
          {apps.map((app) => (
            <Table.Row key={app.id}>
              <Table.Cell>{app.id}</Table.Cell>
              <Table.Cell>{app.name}</Table.Cell>
              <Table.Cell>
                <EntityStatus isEnabled={!app.deletedAt} />
              </Table.Cell>
              <Table.Cell>
                {app.type.toUpperCase()}
              </Table.Cell>
              <Table.Cell>
                <AppScopes app={app} />
              </Table.Cell>
              <Table.Cell>
                <Button
                  as={Link}
                  href={`/${locale}/apps/${app.id}`}
                  color='gray'
                  size='sm'>
                  <PencilSquareIcon className='w-4 h-4' />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page

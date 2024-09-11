'use client'

import { useAuth } from '@melody-auth/react'
import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useEffect, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import {
  dataTool,
  proxyTool, routeTool,
} from 'tools'
import EditLink from 'components/EditLink'
import SystemLabel from 'components/SystemLabel'
import PageTitle from 'components/PageTitle'
import CreateButton from 'components/CreateButton'
import ClientTypeLabel from 'components/ClientTypeLabel'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const [scopes, setScopes] = useState([])
  const { acquireToken } = useAuth()

  useEffect(
    () => {
      const getScopes = async () => {
        const token = await acquireToken()
        const data = await proxyTool.getScopes(token)
        setScopes(data.scopes)
      }

      getScopes()
    },
    [acquireToken],
  )

  return (
    <section>
      <div className='mb-6 flex items-center gap-4'>
        <PageTitle title={t('scopes.title')} />
        <CreateButton
          href={`/${locale}${routeTool.Internal.Scopes}/new`}
        />
      </div>
      <Table>
        <Table.Head className='md:hidden'>
          <Table.HeadCell>{t('scopes.scope')}</Table.HeadCell>
        </Table.Head>
        <Table.Head className='max-md:hidden'>
          <Table.HeadCell>{t('scopes.name')}</Table.HeadCell>
          <Table.HeadCell>{t('common.note')}</Table.HeadCell>
          <Table.HeadCell>{t('scopes.type')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y md:hidden'>
          {scopes.map((scope) => (
            <Table.Row key={scope.id}>
              <Table.Cell>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      {scope.name}
                      {dataTool.isSystem(scope.name) && <SystemLabel />}
                      <ClientTypeLabel type={scope.type} />
                    </div>
                    {scope.note}
                  </div>
                  <EditLink
                    href={`/${locale}/scopes/${scope.id}`}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Body className='divide-y max-md:hidden'>
          {scopes.map((scope) => (
            <Table.Row key={scope.id}>
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  {scope.name}
                  {dataTool.isSystem(scope.name) && <SystemLabel />}
                </div>
              </Table.Cell>
              <Table.Cell>
                {scope.note}
              </Table.Cell>
              <Table.Cell>
                <ClientTypeLabel type={scope.type} />
              </Table.Cell>
              <Table.Cell>
                <EditLink
                  href={`/${locale}/scopes/${scope.id}`}
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

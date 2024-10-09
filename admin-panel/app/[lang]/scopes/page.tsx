'use client'

import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import useCurrentLocale from 'hooks/useCurrentLocale'
import {
  dataTool,
  routeTool,
} from 'tools'
import EditLink from 'components/EditLink'
import SystemLabel from 'components/SystemLabel'
import PageTitle from 'components/PageTitle'
import CreateButton from 'components/CreateButton'
import ClientTypeLabel from 'components/ClientTypeLabel'
import { useGetApiV1ScopesQuery } from 'services/auth/api'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const { data } = useGetApiV1ScopesQuery()
  const scopes = data?.scopes ?? []

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
            <Table.Row
              data-testid='scopeRow'
              key={scope.id}>
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

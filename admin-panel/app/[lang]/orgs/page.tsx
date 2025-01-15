'use client'

import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import useCurrentLocale from 'hooks/useCurrentLocale'
import { routeTool } from 'tools'
import EditLink from 'components/EditLink'
import PageTitle from 'components/PageTitle'
import CreateButton from 'components/CreateButton'
import {
  useGetApiV1OrgsQuery, Org,
} from 'services/auth/api'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const { data } = useGetApiV1OrgsQuery()
  const orgs = data?.orgs ?? []

  const renderEditButton = (org: Org) => {
    return (
      <EditLink
        href={`/${locale}/orgs/${org.id}`}
      />
    )
  }

  return (
    <section>
      <div className='mb-6 flex items-center gap-4'>
        <PageTitle title={t('orgs.title')} />
        <CreateButton
          href={`/${locale}${routeTool.Internal.Orgs}/new`}
        />
      </div>
      <Table>
        <Table.Head className='md:hidden'>
          <Table.HeadCell>{t('orgs.org')}</Table.HeadCell>
        </Table.Head>
        <Table.Head className='max-md:hidden'>
          <Table.HeadCell>{t('orgs.name')}</Table.HeadCell>
          <Table.HeadCell>{t('orgs.slug')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y md:hidden'>
          {orgs.map((org) => (
            <Table.Row
              key={org.id}
              data-testid='roleRow'>
              <Table.Cell>
                <section className='flex justify-between items-center'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      {org.name}
                    </div>
                    <div className='flex items-center gap-2'>
                      {org.slug}
                    </div>
                    <div className='md:hidden'>
                      {renderEditButton(org)}
                    </div>
                  </div>
                </section>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Body className='divide-y max-md:hidden'>
          {orgs.map((org) => (
            <Table.Row key={org.id}>
              <Table.Cell>
                {org.name}
              </Table.Cell>
              <Table.Cell>
                {org.slug}
              </Table.Cell>
              <Table.Cell>
                {renderEditButton(org)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page

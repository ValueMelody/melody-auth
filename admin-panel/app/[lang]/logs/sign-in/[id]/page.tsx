'use client'

import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import PageTitle from 'components/PageTitle'
import { useGetApiV1LogsSignInByIdQuery } from 'services/auth/api'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const { data } = useGetApiV1LogsSignInByIdQuery({ id: Number(id) })
  const log = data?.log

  if (!log) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('logs.signInLog')}
      />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell className='max-md:w-24 md:w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('logs.userId')}</Table.Cell>
              <Table.Cell>
                {log.userId}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('logs.ip')}</Table.Cell>
              <Table.Cell>
                {log.ip}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('logs.detail')}</Table.Cell>
              <Table.Cell>
                {log.detail}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{log.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{log.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
    </section>
  )
}

export default Page

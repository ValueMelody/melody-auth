'use client'

import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import PageTitle from 'components/PageTitle'
import { useGetApiV1LogsSmsByIdQuery } from 'services/auth/api'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()

  const { data } = useGetApiV1LogsSmsByIdQuery({ id: Number(id) })
  const log = data?.log

  if (!log) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('logs.smsLog')}
      />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell className='max-md:w-24 md:w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('logs.receiver')}</Table.Cell>
              <Table.Cell>
                {log.receiver}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('logs.response')}</Table.Cell>
              <Table.Cell>
                {log.response}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('logs.content')}</Table.Cell>
              <Table.Cell>
                {log.content}
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

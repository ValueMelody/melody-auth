'use client'

import { useAuth } from '@melody-auth/react'
import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useEffect, useState,
} from 'react'
import { proxyTool } from 'tools'
import PageTitle from 'components/PageTitle'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()

  const [log, setLog] = useState()
  const { acquireToken } = useAuth()

  useEffect(
    () => {
      const getLog = async () => {
        const token = await acquireToken()
        const data = await proxyTool.sendNextRequest({
          endpoint: `/api/logs/email/${id}`,
          method: 'GET',
          token,
        })
        setLog(data.log)
      }

      getLog()
    },
    [acquireToken, id],
  )

  if (!log) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('logs.emailLog')}
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
                <div dangerouslySetInnerHTML={{ __html: log.content }} />
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

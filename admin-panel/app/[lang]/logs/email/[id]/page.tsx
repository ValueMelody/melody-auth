'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import PageTitle from 'components/PageTitle'
import { useGetApiV1LogsEmailByIdQuery } from 'services/auth/api'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const { data } = useGetApiV1LogsEmailByIdQuery({ id: Number(id) })
  const log = data?.log

  if (!log) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('logs.emailLogs')}
      />
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='max-md:w-24 md:w-48'>{t('common.property')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y'>
            <TableRow>
              <TableCell>{t('logs.receiver')}</TableCell>
              <TableCell>
                {log.receiver}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('logs.response')}</TableCell>
              <TableCell>
                {log.response}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('logs.content')}</TableCell>
              <TableCell>
                <div dangerouslySetInnerHTML={{ __html: log.content }} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{log.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{log.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </section>
  )
}

export default Page

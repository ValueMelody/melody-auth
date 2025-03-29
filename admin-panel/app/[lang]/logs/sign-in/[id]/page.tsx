'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { useGetApiV1LogsSignInByIdQuery } from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import { routeTool } from 'tools'
import LoadingPage from 'components/LoadingPage'
const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const {
    data, isLoading,
  } = useGetApiV1LogsSignInByIdQuery({ id: Number(id) })
  const log = data?.log

  if (isLoading) return <LoadingPage />

  if (!log) return null

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('logs.signInLog') }}
        parent={{
          href: routeTool.Internal.Logs,
          label: t('logs.title'),
        }}
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
              <TableCell>{t('logs.userId')}</TableCell>
              <TableCell>
                {log.userId}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('logs.ip')}</TableCell>
              <TableCell>
                {log.ip}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('logs.detail')}</TableCell>
              <TableCell>
                {log.detail}
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

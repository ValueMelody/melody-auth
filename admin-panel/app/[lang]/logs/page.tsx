'use client'

import { useTranslations } from 'next-intl'
import {
  useMemo, useState,
} from 'react'
import Pagination from 'components/Pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui/table'
import PageTitle from 'components/PageTitle'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'
import ConfigBooleanValue from 'components/ConfigBooleanValue'
import ViewLink from 'components/ViewLink'
import {
  useGetApiV1LogsEmailQuery, useGetApiV1LogsSignInQuery, useGetApiV1LogsSmsQuery,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
import { routeTool } from 'tools'

const PageSize = 10

const Page = () => {
  const t = useTranslations()

  const configs = useSignalValue(configSignal)

  const [emailLogPageNumber, setEmailLogPageNumber] = useState(1)
  const {
    data: emailData, isLoading: isEmailLoading,
  } = useGetApiV1LogsEmailQuery({
    pageNumber: emailLogPageNumber,
    pageSize: PageSize,
  })
  const emailLogs = emailData?.logs ?? []
  const emailLogCount = emailData?.count ?? 0

  const [smsLogPageNumber, setSmsLogPageNumber] = useState(1)
  const {
    data: smsData, isLoading: isSmsLoading,
  } = useGetApiV1LogsSmsQuery({
    pageNumber: smsLogPageNumber,
    pageSize: PageSize,
  })
  const smsLogs = smsData?.logs ?? []
  const smsLogCount = smsData?.count ?? 0

  const [signInLogPageNumber, setSignInLogPageNumber] = useState(1)
  const {
    data: signInData, isLoading: isSignInLoading,
  } = useGetApiV1LogsSignInQuery({
    pageNumber: signInLogPageNumber,
    pageSize: PageSize,
  })
  const signInLogs = signInData?.logs ?? []
  const signInLogCount = signInData?.count ?? 0

  const emailLogTotalPages = useMemo(
    () => Math.ceil(emailLogCount / PageSize),
    [emailLogCount],
  )

  const smsLogTotalPages = useMemo(
    () => Math.ceil(smsLogCount / PageSize),
    [smsLogCount],
  )

  const signInLogTotalPages = useMemo(
    () => Math.ceil(signInLogCount / PageSize),
    [signInLogCount],
  )

  const handleEmailLogPageChange = (page: number) => {
    setEmailLogPageNumber(page)
  }

  const handleSmsLogPageChange = (page: number) => {
    setSmsLogPageNumber(page)
  }

  const handleSignInLogPageChange = (page: number) => {
    setSignInLogPageNumber(page)
  }

  if (!configs) return <LoadingPage />

  if (isEmailLoading || isSmsLoading || isSignInLoading) return <LoadingPage />

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('logs.title') }}
      />
      {configs.ENABLE_EMAIL_LOG && (
        <>
          <PageTitle
            className='mb-6'
            title={t('logs.emailLogs')}
          />
          <Table className='break-all'>
            <TableHeader>
              <TableRow>
                <TableHead>{t('logs.receiver')}</TableHead>
                <TableHead>{t('logs.success')}</TableHead>
                <TableHead>{t('logs.time')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody className='divide-y'>
              {emailLogs.map((log) => (
                <TableRow
                  data-testid='emailLogRow'
                  key={log.id}>
                  <TableCell>{log.receiver}</TableCell>
                  <TableCell><ConfigBooleanValue config={log.success}/></TableCell>
                  <TableCell>{log.createdAt}</TableCell>
                  <TableCell>
                    <ViewLink
                      href={`${routeTool.Internal.Logs}/email/${log.id}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {emailLogTotalPages > 1 && (
            <Pagination
              className='mt-8'
              currentPage={emailLogPageNumber}
              totalPages={emailLogTotalPages}
              onPageChange={handleEmailLogPageChange}
              previousLabel={t('common.previous')}
              nextLabel={t('common.next')}
            />
          )}
        </>
      )}
      {configs.ENABLE_SMS_LOG && (
        <>
          <PageTitle
            className='mt-8 mb-6'
            title={t('logs.smsLogs')}
          />
          <Table className='break-all'>
            <TableHeader>
              <TableRow>
                <TableHead>{t('logs.receiver')}</TableHead>
                <TableHead>{t('logs.success')}</TableHead>
                <TableHead>{t('logs.time')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody className='divide-y'>
              {smsLogs.map((log) => (
                <TableRow
                  data-testid='smsLogRow'
                  key={log.id}>
                  <TableCell>{log.receiver}</TableCell>
                  <TableCell><ConfigBooleanValue config={log.success}/></TableCell>
                  <TableCell>{log.createdAt}</TableCell>
                  <TableCell>
                    <ViewLink
                      href={`${routeTool.Internal.Logs}/sms/${log.id}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {smsLogTotalPages > 1 && (
            <Pagination
              className='mt-8'
              currentPage={smsLogPageNumber}
              totalPages={smsLogTotalPages}
              onPageChange={handleSmsLogPageChange}
              previousLabel={t('common.previous')}
              nextLabel={t('common.next')}
            />
          )}
        </>
      )}
      {configs.ENABLE_SIGN_IN_LOG && (
        <>
          <PageTitle
            className='mt-8 mb-6'
            title={t('logs.signInLogs')}
          />
          <Table className='break-all'>
            <TableHeader>
              <TableRow>
                <TableHead>{t('logs.userId')}</TableHead>
                <TableHead>{t('logs.time')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody className='divide-y'>
              {signInLogs.map((log) => (
                <TableRow
                  data-testid='signInRow'
                  key={log.id}>
                  <TableCell>{log.userId}</TableCell>
                  <TableCell>{log.createdAt}</TableCell>
                  <TableCell>
                    <ViewLink
                      href={`${routeTool.Internal.Logs}/sign-in/${log.id}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {signInLogTotalPages > 1 && (
            <Pagination
              className='mt-8'
              currentPage={signInLogPageNumber}
              totalPages={signInLogTotalPages}
              onPageChange={handleSignInLogPageChange}
              previousLabel={t('common.previous')}
              nextLabel={t('common.next')}
            />
          )}
        </>
      )}
    </section>
  )
}

export default Page

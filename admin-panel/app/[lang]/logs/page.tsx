'use client'

import { useTranslations } from 'next-intl'
import {
  Pagination,
  Spinner, Table,
} from 'flowbite-react'
import {
  useMemo, useState,
} from 'react'
import PageTitle from 'components/PageTitle'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'
import ConfigBooleanValue from 'components/ConfigBooleanValue'
import ViewLink from 'components/ViewLink'
import useCurrentLocale from 'hooks/useCurrentLocale'
import {
  useGetApiV1LogsEmailQuery, useGetApiV1LogsSignInQuery, useGetApiV1LogsSmsQuery,
} from 'services/auth/api'

const PageSize = 10

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const configs = useSignalValue(configSignal)

  const [emailLogPageNumber, setEmailLogPageNumber] = useState(1)
  const { data: emailData } = useGetApiV1LogsEmailQuery({
    pageNumber: emailLogPageNumber,
    pageSize: PageSize,
  })
  const emailLogs = emailData?.logs ?? []
  const emailLogCount = emailData?.count ?? 0

  const [smsLogPageNumber, setSmsLogPageNumber] = useState(1)
  const { data: smsData } = useGetApiV1LogsSmsQuery({
    pageNumber: smsLogPageNumber,
    pageSize: PageSize,
  })
  const smsLogs = smsData?.logs ?? []
  const smsLogCount = smsData?.count ?? 0

  const [signInLogPageNumber, setSignInLogPageNumber] = useState(1)
  const { data: signInData } = useGetApiV1LogsSignInQuery({
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

  if (!configs) return <Spinner />

  return (
    <section>
      {configs.ENABLE_EMAIL_LOG && (
        <>
          <PageTitle
            className='mt-8 mb-6'
            title={t('logs.emailLogs')}
          />
          <Table className='break-all'>
            <Table.Head>
              <Table.HeadCell>{t('logs.receiver')}</Table.HeadCell>
              <Table.HeadCell>{t('logs.success')}</Table.HeadCell>
              <Table.HeadCell>{t('logs.time')}</Table.HeadCell>
              <Table.HeadCell />
            </Table.Head>
            <Table.Body className='divide-y'>
              {emailLogs.map((log) => (
                <Table.Row key={log.id}>
                  <Table.Cell>{log.receiver}</Table.Cell>
                  <Table.Cell><ConfigBooleanValue config={log.success}/></Table.Cell>
                  <Table.Cell>{log.createdAt}</Table.Cell>
                  <Table.Cell>
                    <ViewLink
                      href={`/${locale}/logs/email/${log.id}`}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {emailLogTotalPages > 1 && (
            <Pagination
              className='mt-8'
              layout='pagination'
              currentPage={emailLogPageNumber}
              totalPages={emailLogTotalPages}
              onPageChange={handleEmailLogPageChange}
              previousLabel={t('common.previous')}
              nextLabel={t('common.next')}
              showIcons
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
            <Table.Head>
              <Table.HeadCell>{t('logs.receiver')}</Table.HeadCell>
              <Table.HeadCell>{t('logs.success')}</Table.HeadCell>
              <Table.HeadCell>{t('logs.time')}</Table.HeadCell>
              <Table.HeadCell />
            </Table.Head>
            <Table.Body className='divide-y'>
              {smsLogs.map((log) => (
                <Table.Row key={log.id}>
                  <Table.Cell>{log.receiver}</Table.Cell>
                  <Table.Cell><ConfigBooleanValue config={log.success}/></Table.Cell>
                  <Table.Cell>{log.createdAt}</Table.Cell>
                  <Table.Cell>
                    <ViewLink
                      href={`/${locale}/logs/sms/${log.id}`}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {smsLogTotalPages > 1 && (
            <Pagination
              className='mt-8'
              layout='pagination'
              currentPage={smsLogPageNumber}
              totalPages={smsLogTotalPages}
              onPageChange={handleSmsLogPageChange}
              previousLabel={t('common.previous')}
              nextLabel={t('common.next')}
              showIcons
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
            <Table.Head>
              <Table.HeadCell>{t('logs.userId')}</Table.HeadCell>
              <Table.HeadCell>{t('logs.time')}</Table.HeadCell>
              <Table.HeadCell />
            </Table.Head>
            <Table.Body className='divide-y'>
              {signInLogs.map((log) => (
                <Table.Row key={log.id}>
                  <Table.Cell>{log.userId}</Table.Cell>
                  <Table.Cell>{log.createdAt}</Table.Cell>
                  <Table.Cell>
                    <ViewLink
                      href={`/${locale}/logs/sign-in/${log.id}`}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {signInLogTotalPages > 1 && (
            <Pagination
              className='mt-8'
              layout='pagination'
              currentPage={signInLogPageNumber}
              totalPages={signInLogTotalPages}
              onPageChange={handleSignInLogPageChange}
              previousLabel={t('common.previous')}
              nextLabel={t('common.next')}
              showIcons
            />
          )}
        </>
      )}
    </section>
  )
}

export default Page

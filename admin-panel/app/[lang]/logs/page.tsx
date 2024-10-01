'use client'

import { useTranslations } from 'next-intl'
import {
  Pagination,
  Spinner, Table,
} from 'flowbite-react'
import {
  useEffect, useMemo, useState,
} from 'react'
import { useAuth } from '@melody-auth/react'
import PageTitle from 'components/PageTitle'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'
import { proxyTool } from 'tools'
import ConfigBooleanValue from 'components/ConfigBooleanValue'
import ViewLink from 'components/ViewLink'
import useCurrentLocale from 'hooks/useCurrentLocale'

const PageSize = 10

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const configs = useSignalValue(configSignal)
  const { acquireToken } = useAuth()

  const [emailLogs, setEmailLogs] = useState([])
  const [emailLogPageNumber, setEmailLogPageNumber] = useState(1)
  const [emailLogCount, setEmailLogCount] = useState(0)

  const [smsLogs, setSmsLogs] = useState([])
  const [smsLogPageNumber, setSmsLogPageNumber] = useState(1)
  const [smsLogCount, setSmsLogCount] = useState(0)

  const [signInLogs, setSignInLogs] = useState([])
  const [signInLogPageNumber, setSignInLogPageNumber] = useState(1)
  const [signInLogCount, setSignInLogCount] = useState(0)

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

  useEffect(
    () => {
      const getEmailLogs = async () => {
        const token = await acquireToken()
        const baseUrl = `/api/logs/email?page_size=${PageSize}&page_number=${emailLogPageNumber}`
        const data = await proxyTool.sendNextRequest({
          endpoint: baseUrl,
          method: 'GET',
          token,
        })
        setEmailLogs(data.logs)
        setEmailLogCount(data.count)
      }

      getEmailLogs()
    },
    [acquireToken, emailLogPageNumber],
  )

  useEffect(
    () => {
      const getSmsLogs = async () => {
        const token = await acquireToken()
        const baseUrl = `/api/logs/sms?page_size=${PageSize}&page_number=${smsLogPageNumber}`
        const data = await proxyTool.sendNextRequest({
          endpoint: baseUrl,
          method: 'GET',
          token,
        })
        setSmsLogs(data.logs)
        setSmsLogCount(data.count)
      }

      getSmsLogs()
    },
    [acquireToken, smsLogPageNumber],
  )

  useEffect(
    () => {
      const getSignInLogs = async () => {
        const token = await acquireToken()
        const baseUrl = `/api/logs/sign-in?page_size=${PageSize}&page_number=${signInLogPageNumber}`
        const data = await proxyTool.sendNextRequest({
          endpoint: baseUrl,
          method: 'GET',
          token,
        })
        setSignInLogs(data.logs)
        setSignInLogCount(data.count)
      }

      getSignInLogs()
    },
    [acquireToken, signInLogPageNumber],
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

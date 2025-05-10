'use client'

import { useTranslations } from 'next-intl'
import {
  useMemo, useState,
} from 'react'
import { useAuth } from '@melody-auth/react'
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
  useDeleteApiV1LogsEmailMutation,
  useDeleteApiV1LogsSignInMutation,
  useDeleteApiV1LogsSmsMutation,
  useGetApiV1LogsEmailQuery,
  useGetApiV1LogsSignInQuery,
  useGetApiV1LogsSmsQuery,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
import {
  accessTool, routeTool,
} from 'tools'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogTitle, AlertDialogDescription,
  AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter,
} from 'components/ui/alert-dialog'

const PageSize = 10

const CleanAlert = ({
  show,
  onCancel,
  onConfirm,
}: {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const t = useTranslations()

  return (
    <AlertDialog open={show}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('logs.cleanAlertTitle')}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {t('logs.cleanAlertDescription')}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <Button
            variant='outline'
            onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm}>
            {t('common.delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const Page = () => {
  const t = useTranslations()

  const configs = useSignalValue(configSignal)

  const [cleanTarget, setCleanTarget] = useState<'email' | 'sms' | 'signIn' | ''>('')

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

  const [deleteEmailLogs] = useDeleteApiV1LogsEmailMutation()
  const [deleteSmsLogs] = useDeleteApiV1LogsSmsMutation()
  const [deleteSignInLogs] = useDeleteApiV1LogsSignInMutation()

  const { userInfo } = useAuth()
  const showCleanBtn = accessTool.isAllowedAccess(
    accessTool.Access.WriteLog,
    userInfo?.roles,
  )

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

  const handleConfirmClean = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const dateBefore = thirtyDaysAgo.toISOString()
    switch (cleanTarget) {
    case 'email':
      deleteEmailLogs({ before: dateBefore })
      break
    case 'sms':
      deleteSmsLogs({ before: dateBefore })
      break
    case 'signIn':
      deleteSignInLogs({ before: dateBefore })
      break
    }
    setCleanTarget('')
  }

  if (!configs) return <LoadingPage />

  if (isEmailLoading || isSmsLoading || isSignInLoading) return <LoadingPage />

  return (
    <section className='flex flex-col gap-8'>
      <CleanAlert
        show={!!cleanTarget}
        onCancel={() => setCleanTarget('')}
        onConfirm={handleConfirmClean}
      />
      <Breadcrumb
        page={{ label: t('logs.title') }}
      />
      {configs.ENABLE_EMAIL_LOG && (
        <section className='flex flex-col'>
          <header className='flex gap-8 items-center mb-6'>
            <PageTitle
              title={t('logs.emailLogs')}
            />
            {showCleanBtn && (
              <Button
                data-testid='emailLogCleanBtn'
                variant='outline'
                size='sm'
                onClick={() => setCleanTarget('email')}
              >
                {t('logs.clean')}
              </Button>
            )}
          </header>
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
        </section>
      )}
      {configs.ENABLE_SMS_LOG && (
        <section className='flex flex-col'>
          <header className='flex gap-8 items-center mb-6'>
            <PageTitle
              title={t('logs.smsLogs')}
            />
            {showCleanBtn && (
              <Button
                data-testid='smsLogCleanBtn'
                variant='outline'
                size='sm'
                onClick={() => setCleanTarget('sms')}
              >
                {t('logs.clean')}
              </Button>
            )}
          </header>
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
        </section>
      )}
      {configs.ENABLE_SIGN_IN_LOG && (
        <section className='flex flex-col'>
          <header className='flex gap-8 items-center mb-6'>
            <PageTitle
              title={t('logs.signInLogs')}
            />
            {showCleanBtn && (
              <Button
                variant='outline'
                size='sm'
                data-testid='signInLogCleanBtn'
                onClick={() => setCleanTarget('signIn')}
              >
                {t('logs.clean')}
              </Button>
            )}
          </header>
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
        </section>
      )}
    </section>
  )
}

export default Page

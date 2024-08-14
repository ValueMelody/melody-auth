'use client'

import { useAuth } from '@melody-auth/react'
import {
  Pagination, Table,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useEffect, useMemo, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import { proxyTool } from 'tools'
import EntityStatusLabel from 'components/EntityStatusLabel'
import EditLink from 'components/EditLink'
import useSignalValue from 'app/useSignalValue'
import {
  userInfoSignal, configSignal,
} from 'signals'
import IsSelfLabel from 'components/IsSelfLabel'
import PageTitle from 'components/PageTitle'

const PageSize = 20

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const [users, setUsers] = useState([])
  const { acquireToken } = useAuth()
  const userInfo = useSignalValue(userInfoSignal)
  const configs = useSignalValue(configSignal)
  const [pageNumber, setPageNumber] = useState(1)
  const [count, setCount] = useState(0)

  const totalPages = useMemo(
    () => Math.ceil(count / PageSize),
    [count],
  )

  const handlePageChange = (page: number) => {
    setPageNumber(page)
  }

  useEffect(
    () => {
      const getUsers = async () => {
        const token = await acquireToken()
        const data = await proxyTool.sendNextRequest({
          endpoint: `/api/users?page_size=${PageSize}&page_number=${pageNumber}`,
          method: 'GET',
          token,
        })
        setUsers(data.users)
        setCount(data.count)
      }

      getUsers()
    },
    [acquireToken, pageNumber],
  )

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('users.title')} />
      <Table>
        <Table.Head>
          <Table.HeadCell>{t('users.authId')}</Table.HeadCell>
          <Table.HeadCell>
            {t('users.email')}
          </Table.HeadCell>
          <Table.HeadCell>{t('users.status')}</Table.HeadCell>
          {configs.ENABLE_NAMES && (
            <Table.HeadCell>{t('users.name')}</Table.HeadCell>
          )}
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y'>
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  {user.authId}
                  {user.authId === userInfo.authId && <IsSelfLabel />}
                </div>
              </Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                <EntityStatusLabel isEnabled={user.isActive} />
              </Table.Cell>
              {configs.ENABLE_NAMES && (
                <Table.Cell>
                  {`${user.firstName ?? ''} ${user.lastName ?? ''}`}
                </Table.Cell>
              )}
              <Table.Cell>
                <EditLink
                  href={`/${locale}/users/${user.authId}`}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {totalPages > 1 && (
        <Pagination
          className='mt-8'
          layout='pagination'
          currentPage={pageNumber}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          previousLabel={t('common.previous')}
          nextLabel={t('common.next')}
          showIcons
        />
      )}
    </section>
  )
}

export default Page

'use client'

import {
  Pagination, Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useMemo, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import EntityStatusLabel from 'components/EntityStatusLabel'
import EditLink from 'components/EditLink'
import useSignalValue from 'app/useSignalValue'
import {
  userInfoSignal, configSignal,
} from 'signals'
import IsSelfLabel from 'components/IsSelfLabel'
import PageTitle from 'components/PageTitle'
import useDebounce from 'hooks/useDebounce'
import { useGetApiV1UsersQuery } from 'services/auth/api'

const PageSize = 20

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const userInfo = useSignalValue(userInfoSignal)
  const configs = useSignalValue(configSignal)
  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data } = useGetApiV1UsersQuery({
    pageSize: PageSize,
    pageNumber,
    search: debouncedSearch || undefined,
  })
  const users = data?.users ?? []
  const count = data?.count ?? 0

  const totalPages = useMemo(
    () => Math.ceil(count / PageSize),
    [count],
  )

  const handlePageChange = (page: number) => {
    setPageNumber(page)
  }

  return (
    <section>
      <header className='mb-6 flex items-center gap-4'>
        <PageTitle
          title={t('users.title')}
        />
        <TextInput
          className='w-60'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('users.search')}
        />
      </header>
      <Table>
        <Table.Head className='md:hidden'>
          <Table.HeadCell>{t('users.user')}</Table.HeadCell>
        </Table.Head>
        <Table.Head className='max-md:hidden'>
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
        <Table.Body className='divide-y md:hidden'>
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <section className='flex items-center justify-between'>
                  <section className='flex flex-col gap-2'>
                    {user.authId}
                    {user.authId === userInfo.authId && <div className='flex'><IsSelfLabel /></div>}
                    {user.email}
                    <EntityStatusLabel isEnabled={user.isActive} />
                    {configs.ENABLE_NAMES && (
                      <p>
                        {`${user.firstName ?? ''} ${user.lastName ?? ''}`}
                      </p>
                    )}
                  </section>
                  <EditLink
                    href={`/${locale}/users/${user.authId}`}
                  />
                </section>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Body className='divide-y max-md:hidden'>
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

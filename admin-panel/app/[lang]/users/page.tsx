'use client'

import { PencilSquareIcon } from '@heroicons/react/16/solid'
import { useAuth } from '@melody-auth/react'
import {
  Button, Table,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  useEffect, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import UserStatus from 'components/UserStatus'
import UserEmailVerified from 'components/UserEmailVerified'
import { proxyTool } from 'tools'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const [users, setUsers] = useState([])
  const { acquireToken } = useAuth()

  useEffect(
    () => {
      const getUsers = async () => {
        const token = await acquireToken()
        const data = await proxyTool.sendNextRequest({
          endpoint: '/api/users',
          method: 'GET',
          token,
        })
        setUsers(data.users)
      }

      getUsers()
    },
    [acquireToken],
  )

  return (
    <section>
      <Table>
        <Table.Head>
          <Table.HeadCell>{t('users.authId')}</Table.HeadCell>
          <Table.HeadCell>{t('users.email')}</Table.HeadCell>
          <Table.HeadCell>{t('users.status')}</Table.HeadCell>
          <Table.HeadCell>{t('users.emailVerified')}</Table.HeadCell>
          <Table.HeadCell>{t('users.name')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y'>
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.authId}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                <UserStatus user={user} />
              </Table.Cell>
              <Table.Cell>
                <UserEmailVerified user={user} />
              </Table.Cell>
              <Table.Cell>{`${user.firstName ?? ''} ${user.lastName ?? ''}`} </Table.Cell>
              <Table.Cell>
                <Button
                  as={Link}
                  href={`/${locale}/users/${user.authId}`}
                  color='gray'
                  size='sm'>
                  <PencilSquareIcon className='w-4 h-4' />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page

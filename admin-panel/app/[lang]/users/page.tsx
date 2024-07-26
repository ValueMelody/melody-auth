'use client'

import { useAuth } from '@melody-auth/react'
import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useEffect, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import UserEmailVerified from 'components/UserEmailVerified'
import { proxyTool } from 'tools'
import EntityStatusLabel from 'components/EntityStatusLabel'
import EditLink from 'components/EditLink'
import useSignalValue from 'app/useSignalValue'
import { userInfoSignal } from 'signals'
import IsSelfLabel from 'components/IsSelfLabel'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const [users, setUsers] = useState([])
  const { acquireToken } = useAuth()
  const userInfo = useSignalValue(userInfoSignal)

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
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  {user.authId}
                  {user.authId === userInfo.authId && <IsSelfLabel />}
                </div>
              </Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                <EntityStatusLabel isEnabled={!user.deletedAt} />
              </Table.Cell>
              <Table.Cell>
                <UserEmailVerified user={user} />
              </Table.Cell>
              <Table.Cell>{`${user.firstName ?? ''} ${user.lastName ?? ''}`} </Table.Cell>
              <Table.Cell>
                <EditLink
                  href={`/${locale}/users/${user.authId}`}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page

'use client'

import { useAuth } from '@melody-auth/react'
import {
  Badge, Table,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useEffect, useState,
} from 'react'
import { proxyTool } from 'tools'

const Page = () => {
  const t = useTranslations()

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
          <Table.HeadCell>{t('users.name')}</Table.HeadCell>
          <Table.HeadCell>{t('users.status')}</Table.HeadCell>
        </Table.Head>
        <Table.Body className='divide-y'>
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.authId}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{`${user.firstName ?? ''} ${user.lastName ?? ''}`} </Table.Cell>
              <Table.Cell>
                <div className='flex'>
                  {user.deletedAt ? (<Badge color='failure'>Disabled</Badge>) : (<Badge color='success'>Active</Badge>)}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page

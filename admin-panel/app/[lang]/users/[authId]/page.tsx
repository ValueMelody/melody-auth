'use client'

import { useAuth } from '@melody-auth/react'
import {
  Badge, Table,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useEffect, useState,
} from 'react'
import UserEmailVerified from 'components/UserEmailVerified'
import UserStatus from 'components/UserStatus'
import { proxyTool } from 'tools'

const Page = () => {
  const { authId } = useParams()

  const t = useTranslations()

  const [user, setUser] = useState()
  const { acquireToken } = useAuth()

  useEffect(
    () => {
      const getUser = async () => {
        const token = await acquireToken()
        const data = await proxyTool.sendNextRequest({
          endpoint: `/api/users/${authId}`,
          method: 'GET',
          token,
        })
        setUser(data.user)
      }

      getUser()
    },
    [acquireToken, authId],
  )

  if (!user) return null

  return (
    <section>
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell>{t('users.property')}</Table.HeadCell>
            <Table.HeadCell>{t('users.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('users.authId')}</Table.Cell>
              <Table.Cell>{user.authId}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.email')}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.status')}</Table.Cell>
              <Table.Cell>
                <UserStatus user={user} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.emailVerified')}</Table.Cell>
              <Table.Cell>
                <UserEmailVerified user={user} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.roles')}</Table.Cell>
              <Table.Cell>
                <div className='flex items-center gap2'>
                  {user.roles?.map((role) => (
                    <Badge
                      key={role}
                      role={role}>{role}
                    </Badge>
                  ))}
                </div>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.firstName')}</Table.Cell>
              <Table.Cell>{user.firstName}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.lastName')}</Table.Cell>
              <Table.Cell>{user.lastName}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.createdAt')}</Table.Cell>
              <Table.Cell>{user.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.updatedAt')}</Table.Cell>
              <Table.Cell>{user.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
    </section>
  )
}

export default Page

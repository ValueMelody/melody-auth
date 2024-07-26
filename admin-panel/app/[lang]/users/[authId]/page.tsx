'use client'

import { useAuth } from '@melody-auth/react'
import {
  Badge, Button, Table,
  TableCell,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useCallback,
  useEffect, useState,
} from 'react'
import UserEmailVerified from 'components/UserEmailVerified'
import { proxyTool } from 'tools'
import EntityStatusLabel from 'components/EntityStatusLabel'
import ChangeStatusButton from 'components/ChangeStatusButton'

const Page = () => {
  const { authId } = useParams()

  const t = useTranslations()

  const [user, setUser] = useState()
  const [emailResent, setEmailResent] = useState(false)
  const { acquireToken } = useAuth()

  const getUser = useCallback(
    async () => {
      const token = await acquireToken()
      const data = await proxyTool.sendNextRequest({
        endpoint: `/api/users/${authId}`,
        method: 'GET',
        token,
      })
      setUser(data.user)
    },
    [acquireToken, authId],
  )

  const enableUser = async () => {
    const token = await acquireToken()
    const result = await proxyTool.sendNextRequest({
      endpoint: `/api/users/${authId}`,
      method: 'PUT',
      token,
      body: { action: 'enable' },
    })
    if (result) await getUser()
  }

  const disableUser = async () => {
    const token = await acquireToken()
    const result = await proxyTool.sendNextRequest({
      endpoint: `/api/users/${authId}`,
      method: 'PUT',
      token,
      body: { action: 'disable' },
    })
    if (result) await getUser()
  }

  const handleResendVerifyEmail = async () => {
    const token = await acquireToken()
    const result = await proxyTool.sendNextRequest({
      endpoint: `/api/users/${authId}`,
      method: 'POST',
      token,
      body: { action: 'verify-email' },
    })
    if (result) setEmailResent(true)
  }

  useEffect(
    () => {
      getUser()
    },
    [getUser],
  )

  if (!user) return null

  return (
    <section>
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
            <Table.HeadCell />
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
                <EntityStatusLabel isEnabled={!user.deletedAt} />
              </Table.Cell>
              <TableCell>
                <ChangeStatusButton
                  isEnabled={!user.deletedAt}
                  onEnable={enableUser}
                  onDisable={disableUser}
                />
              </TableCell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.emailVerified')}</Table.Cell>
              <Table.Cell>
                <UserEmailVerified user={user} />
              </Table.Cell>
              <Table.Cell>
                {!user.deletedAt && !user.emailVerified && !emailResent && (
                  <Button
                    size='xs'
                    onClick={handleResendVerifyEmail}>
                    {t('users.resend')}
                  </Button>
                )}
                {!user.deletedAt && !user.emailVerified && emailResent && (
                  <div className='flex'>
                    <Badge>{t('users.sent')}</Badge>
                  </div>
                )}
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
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{user.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{user.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
    </section>
  )
}

export default Page

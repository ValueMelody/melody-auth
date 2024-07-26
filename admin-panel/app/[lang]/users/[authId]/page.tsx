'use client'

import { useAuth } from '@melody-auth/react'
import {
  Badge, Button, Checkbox, Label, Table,
  TableCell,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useCallback,
  useEffect, useMemo, useState,
} from 'react'
import { CheckIcon } from '@heroicons/react/16/solid'
import UserEmailVerified from 'components/UserEmailVerified'
import { proxyTool } from 'tools'
import EntityStatusLabel from 'components/EntityStatusLabel'
import ChangeStatusButton from 'components/ChangeStatusButton'
import useSignalValue from 'app/useSignalValue'
import { userInfoSignal } from 'signals'
import IsSelfLabel from 'components/IsSelfLabel'

const Page = () => {
  const { authId } = useParams()

  const t = useTranslations()

  const [user, setUser] = useState()
  const [roles, setRoles] = useState([])
  const [emailResent, setEmailResent] = useState(false)
  const [rolesSaved, setRolesSaved] = useState(false)
  const { acquireToken } = useAuth()
  const [userRoles, setUserRoles] = useState<string[]>([])

  const userInfo = useSignalValue(userInfoSignal)

  const isSelf = useMemo(
    () => userInfo.authId === user?.authId,
    [user, userInfo],
  )

  const getUser = useCallback(
    async () => {
      const token = await acquireToken()
      const data = await proxyTool.sendNextRequest({
        endpoint: `/api/users/${authId}`,
        method: 'GET',
        token,
      })
      setUser(data.user)
      setUserRoles(data.user.roles)
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

  const handleSaveRoles = async () => {
    const token = await acquireToken()
    const result = await proxyTool.sendNextRequest({
      endpoint: `/api/users/${authId}`,
      method: 'PUT',
      token,
      body: {
        action: 'roles', data: { roles: userRoles },
      },
    })
    if (result) {
      await getUser()
      setRolesSaved(true)
    }
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

  const handleToggleUserRole = (role: string) => {
    const newRoles = userRoles.includes(role)
      ? userRoles.filter((userRole) => role !== userRole)
      : [...userRoles, role]
    setUserRoles(newRoles)
    setRolesSaved(false)
  }

  useEffect(
    () => {
      const getRoles = async () => {
        const token = await acquireToken()
        const data = await proxyTool.getRoles(token)
        setRoles(data.roles.filter((role) => !role.deletedAt))
      }

      getUser()
      getRoles()
    },
    [getUser, acquireToken],
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
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  {user.authId}
                  {isSelf && (
                    <IsSelfLabel />
                  )}
                </div>
              </Table.Cell>
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
                {!isSelf && (
                  <ChangeStatusButton
                    isEnabled={!user.deletedAt}
                    onEnable={enableUser}
                    onDisable={disableUser}
                  />
                )}
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
                <div className='flex items-center gap-6'>
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className='flex items-center gap-2'>
                      <Checkbox
                        id={role.id}
                        onChange={() => handleToggleUserRole(role.name)}
                        checked={userRoles.includes(role.name)} />
                      <Label
                        htmlFor={role.id}
                        className='flex'>
                        {role.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  <Button
                    size='xs'
                    onClick={handleSaveRoles}>
                    {t('common.save')}
                  </Button>
                  {rolesSaved && <CheckIcon
                    className='w-6 h-6'
                    color='green' />}
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

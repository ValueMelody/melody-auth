'use client'

import { useAuth } from '@melody-auth/react'
import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useEffect, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import {
  proxyTool, routeTool, typeTool,
} from 'tools'
import EditLink from 'components/EditLink'
import SystemLabel from 'components/SystemLabel'
import PageTitle from 'components/PageTitle'
import CreateButton from 'components/CreateButton'

const isSystem = (name: string) => name === typeTool.Role.SuperAdmin

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const [roles, setRoles] = useState([])
  const { acquireToken } = useAuth()

  useEffect(
    () => {
      const getRoles = async () => {
        const token = await acquireToken()
        const data = await proxyTool.getRoles(token)
        setRoles(data.roles)
      }

      getRoles()
    },
    [acquireToken],
  )

  return (
    <section>
      <div className='mb-6 flex items-center gap-4'>
        <PageTitle title={t('roles.title')} />
        <CreateButton
          href={`/${locale}${routeTool.Internal.Roles}/new`}
        />
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>{t('roles.name')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y'>
          {roles.map((role) => (
            <Table.Row key={role.id}>
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  {role.name}
                  {isSystem(role.name) && <SystemLabel />}
                </div>
              </Table.Cell>
              <Table.Cell>
                {!isSystem(role.name) && (
                  <EditLink
                    href={`/${locale}/roles/${role.id}`}
                  />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page

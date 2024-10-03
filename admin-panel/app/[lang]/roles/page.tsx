'use client'

import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import useCurrentLocale from 'hooks/useCurrentLocale'
import {
  routeTool, typeTool,
} from 'tools'
import EditLink from 'components/EditLink'
import SystemLabel from 'components/SystemLabel'
import PageTitle from 'components/PageTitle'
import CreateButton from 'components/CreateButton'
import {
  Role, useGetApiV1RolesQuery,
} from 'services/auth/api'

const isSystem = (name: string) => name === typeTool.Role.SuperAdmin

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const { data } = useGetApiV1RolesQuery()
  const roles = data?.roles ?? []

  const renderEditButton = (role: Role) => {
    return isSystem(role.name)
      ? null
      : (
        <EditLink
          href={`/${locale}/roles/${role.id}`}
        />
      )
  }

  return (
    <section>
      <div className='mb-6 flex items-center gap-4'>
        <PageTitle title={t('roles.title')} />
        <CreateButton
          href={`/${locale}${routeTool.Internal.Roles}/new`}
        />
      </div>
      <Table>
        <Table.Head className='md:hidden'>
          <Table.HeadCell>{t('roles.role')}</Table.HeadCell>
        </Table.Head>
        <Table.Head className='max-md:hidden'>
          <Table.HeadCell>{t('roles.name')}</Table.HeadCell>
          <Table.HeadCell>{t('common.note')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y md:hidden'>
          {roles.map((role) => (
            <Table.Row key={role.id}>
              <Table.Cell>
                <section className='flex justify-between items-center'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      {role.name}
                      {isSystem(role.name) && <SystemLabel />}
                    </div>
                    <p className='md:hidden'>{role.note}</p>
                  </div>
                  <div className='md:hidden'>
                    {renderEditButton(role)}
                  </div>
                </section>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Body className='divide-y max-md:hidden'>
          {roles.map((role) => (
            <Table.Row key={role.id}>
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  {role.name}
                  {isSystem(role.name) && <SystemLabel />}
                </div>
              </Table.Cell>
              <Table.Cell>
                {role.note}
              </Table.Cell>
              <Table.Cell>
                {renderEditButton(role)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page

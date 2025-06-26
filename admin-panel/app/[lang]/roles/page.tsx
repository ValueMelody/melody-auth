'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@melody-auth/react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import {
  routeTool, accessTool, dataTool,
} from 'tools'
import EditLink from 'components/EditLink'
import SystemLabel from 'components/SystemLabel'
import CreateButton from 'components/CreateButton'
import {
  Role, useGetApiV1RolesQuery,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'

const Page = () => {
  const t = useTranslations()

  const { userInfo } = useAuth()
  const canWriteRole = accessTool.isAllowedAccess(
    accessTool.Access.WriteRole,
    userInfo?.roles,
  )

  const {
    data, isLoading,
  } = useGetApiV1RolesQuery()
  const roles = data?.roles ?? []

  const renderEditButton = (role: Role) => (
    <EditLink
      href={`${routeTool.Internal.Roles}/${role.id}`}
    />
  )

  if (isLoading) return <LoadingPage />

  return (
    <section>
      <div className='mb-8 flex items-center gap-8'>
        <Breadcrumb
          page={{ label: t('roles.title') }}
        />
        {canWriteRole && (
          <CreateButton
            href={`${routeTool.Internal.Roles}/new`}
          />
        )}
      </div>
      <Table>
        <TableHeader className='md:hidden'>
          <TableRow>
            <TableHead>{t('roles.role')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableHeader className='max-md:hidden'>
          <TableRow>
            <TableHead>{t('roles.name')}</TableHead>
            <TableHead>{t('common.note')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className='divide-y md:hidden'>
          {roles.map((role) => (
            <TableRow
              key={role.id}
              data-testid='roleRow'>
              <TableCell>
                <section className='flex justify-between items-center'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      {role.name}
                      {dataTool.isSystemRole(role.name) && <SystemLabel />}
                    </div>
                    <p className='md:hidden'>{role.note}</p>
                  </div>
                  <div className='md:hidden'>
                    {renderEditButton(role)}
                  </div>
                </section>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableBody className='divide-y max-md:hidden'>
          {roles.map((role) => (
            <TableRow
              key={role.id}
              data-testid='roleRow'>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {role.name}
                  {dataTool.isSystemRole(role.name) && <SystemLabel />}
                </div>
              </TableCell>
              <TableCell>
                {role.note}
              </TableCell>
              <TableCell>
                {renderEditButton(role)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

export default Page

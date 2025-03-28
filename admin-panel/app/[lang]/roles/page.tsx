'use client'

import { useTranslations } from 'next-intl'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
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
                      {isSystem(role.name) && <SystemLabel />}
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
                  {isSystem(role.name) && <SystemLabel />}
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

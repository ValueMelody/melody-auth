'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@melody-auth/react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import {
  dataTool,
  routeTool,
  accessTool,
} from 'tools'
import EditLink from 'components/EditLink'
import SystemLabel from 'components/SystemLabel'
import CreateButton from 'components/CreateButton'
import ClientTypeLabel from 'components/ClientTypeLabel'
import { useGetApiV1ScopesQuery } from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'

const Page = () => {
  const t = useTranslations()

  const {
    data, isLoading,
  } = useGetApiV1ScopesQuery()
  const scopes = data?.scopes ?? []

  const { userInfo } = useAuth()
  const canWriteScope = accessTool.isAllowedAccess(
    accessTool.Access.WriteScope,
    userInfo?.roles,
  )

  if (isLoading) return <LoadingPage />

  return (
    <section>
      <Breadcrumb
        page={{ label: t('scopes.title') }}
        action={canWriteScope && (
          <CreateButton
            href={`${routeTool.Internal.Scopes}/new`}
          />
        )}
      />
      <Table>
        <TableHeader className='md:hidden'>
          <TableRow>
            <TableHead>{t('scopes.scope')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableHeader className='max-md:hidden'>
          <TableRow>
            <TableHead>{t('scopes.name')}</TableHead>
            <TableHead>{t('common.note')}</TableHead>
            <TableHead>{t('scopes.type')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className='divide-y md:hidden'>
          {scopes.map((scope) => (
            <TableRow key={scope.id}>
              <TableCell>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      {scope.name}
                      {dataTool.isSystemScope(scope.name) && <SystemLabel />}
                      <ClientTypeLabel type={scope.type} />
                    </div>
                    {scope.note}
                  </div>
                  <EditLink
                    viewOnly={!canWriteScope}
                    href={`${routeTool.Internal.Scopes}/${scope.id}`}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableBody className='divide-y max-md:hidden'>
          {scopes.map((scope) => (
            <TableRow
              data-testid='scopeRow'
              key={scope.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {scope.name}
                  {dataTool.isSystemScope(scope.name) && <SystemLabel />}
                </div>
              </TableCell>
              <TableCell>
                {scope.note}
              </TableCell>
              <TableCell>
                <ClientTypeLabel type={scope.type} />
              </TableCell>
              <TableCell>
                <EditLink
                  viewOnly={!canWriteScope}
                  href={`${routeTool.Internal.Scopes}/${scope.id}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

export default Page

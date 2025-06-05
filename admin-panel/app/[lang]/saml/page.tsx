'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@melody-auth/react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import {
  routeTool, accessTool,
} from 'tools'
import EditLink from 'components/EditLink'
import CreateButton from 'components/CreateButton'
import {
  SamlIdp,
  useGetApiV1SamlIdpsQuery,
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
  } = useGetApiV1SamlIdpsQuery()
  const idps = data?.idps ?? []

  const renderEditButton = (idp: SamlIdp) => {
    return (
      <EditLink
        href={`${routeTool.Internal.Saml}/${idp.id}`}
      />
    )
  }

  if (isLoading) return <LoadingPage />

  return (
    <section>
      <div className='mb-8 flex items-center gap-8'>
        <Breadcrumb
          page={{ label: t('saml.title') }}
        />
        {canWriteRole && (
          <CreateButton
            href={`${routeTool.Internal.Saml}/new`}
          />
        )}
      </div>
      <Table>
        <TableHeader className='md:hidden'>
          <TableRow>
            <TableHead>{t('saml.idp')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableHeader className='max-md:hidden'>
          <TableRow>
            <TableHead>{t('saml.name')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='divide-y md:hidden'>
          {idps.map((idp) => (
            <TableRow
              key={idp.id}
            >
              <TableCell>
                <section className='flex justify-between items-center'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      {idp.name}
                    </div>
                  </div>
                  <div className='md:hidden'>
                    {renderEditButton(idp)}
                  </div>
                </section>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableBody className='divide-y max-md:hidden'>
          {idps.map((idp) => (
            <TableRow
              key={idp.id}
            >
              <TableCell>
                <div className='flex items-center gap-2'>
                  {idp.name}
                </div>
              </TableCell>
              <TableCell>
                {renderEditButton(idp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

export default Page

'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@melody-auth/react'
import Breadcrumb from 'components/Breadcrumb'
import {
  routeTool, accessTool,
} from 'tools'
import CreateButton from 'components/CreateButton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { useGetApiV1UserAttributesQuery } from 'services/auth/api'
import LoadingPage from 'components/LoadingPage'
import EditLink from 'components/EditLink'
import ConfigBooleanValue from 'components/ConfigBooleanValue'
import { Badge } from 'components/ui/badge'

const Page = () => {
  const t = useTranslations()

  const { userInfo } = useAuth()
  const canWriteUserAttribute = accessTool.isAllowedAccess(
    accessTool.Access.WriteUserAttribute,
    userInfo?.roles,
  )

  const {
    data, isLoading,
  } = useGetApiV1UserAttributesQuery()
  const userAttributes = data?.userAttributes ?? []

  if (isLoading) return <LoadingPage />

  return (
    <section>
      <div className='mb-8 flex items-center gap-8'>
        <Breadcrumb
          page={{ label: t('userAttributes.title') }}
        />
        {canWriteUserAttribute && (
          <CreateButton
            href={`${routeTool.Internal.UserAttributes}/new`}
          />
        )}
      </div>
      <Table>
        <TableHeader className='md:hidden'>
          <TableRow>
            <TableHead>{t('userAttributes.userAttribute')}</TableHead>
          </TableRow>
          <TableRow />
        </TableHeader>
        <TableHeader className='max-md:hidden'>
          <TableRow>
            <TableHead>{t('userAttributes.name')}</TableHead>
            <TableHead>{t('userAttributes.includeInSignUpForm')}</TableHead>
            <TableHead>{t('userAttributes.requiredInSignUpForm')}</TableHead>
            <TableHead>{t('userAttributes.includeInIdTokenBody')}</TableHead>
            <TableHead>{t('userAttributes.includeInUserInfo')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className='divide-y md:hidden'>
          {userAttributes.map((userAttribute) => (
            <TableRow key={userAttribute.id}>
              <TableCell>
                <div className='flex flex-wrap items-center justify-between'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      {userAttribute.name}
                    </div>
                  </div>
                  <EditLink
                    href={`${routeTool.Internal.UserAttributes}/${userAttribute.id}`}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-2'>
                  {userAttribute.includeInSignUpForm && (
                    <Badge>{t('userAttributes.includeInSignUpForm')}</Badge>
                  )}
                  {userAttribute.requiredInSignUpForm && (
                    <Badge>{t('userAttributes.requiredInSignUpForm')}</Badge>
                  )}
                  {userAttribute.includeInIdTokenBody && (
                    <Badge>{t('userAttributes.includeInIdTokenBody')}</Badge>
                  )}
                  {userAttribute.includeInUserInfo && (
                    <Badge>{t('userAttributes.includeInUserInfo')}</Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableBody className='divide-y max-md:hidden'>
          {userAttributes.map((userAttribute) => (
            <TableRow
              data-testid='userAttributeRow'
              key={userAttribute.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {userAttribute.name}
                </div>
              </TableCell>
              <TableCell>
                <ConfigBooleanValue config={userAttribute.includeInSignUpForm} />
              </TableCell>
              <TableCell>
                <ConfigBooleanValue config={userAttribute.requiredInSignUpForm} />
              </TableCell>
              <TableCell>
                <ConfigBooleanValue config={userAttribute.includeInIdTokenBody} />
              </TableCell>
              <TableCell>
                <ConfigBooleanValue config={userAttribute.includeInUserInfo} />
              </TableCell>
              <TableCell>
                <EditLink
                  href={`${routeTool.Internal.UserAttributes}/${userAttribute.id}`}
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

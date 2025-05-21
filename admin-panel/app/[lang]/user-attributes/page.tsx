'use client'

import { useTranslations } from 'next-intl'
import Breadcrumb from 'components/Breadcrumb'
import { routeTool, accessTool } from 'tools'
import { useAuth } from '@melody-auth/react'
import CreateButton from 'components/CreateButton'

const Page = () => {
  const t = useTranslations()

  const { userInfo } = useAuth()
  const canWriteUserAttribute = accessTool.isAllowedAccess(
    accessTool.Access.WriteUserAttribute,
    userInfo?.roles,
  )

  return (
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
  )
}

export default Page

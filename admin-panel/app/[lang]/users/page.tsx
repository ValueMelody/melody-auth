'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useAuth } from '@melody-auth/react'
import { PlusIcon } from '@heroicons/react/16/solid'
import UserTable from 'components/UserTable'
import Breadcrumb from 'components/Breadcrumb'
import { Button } from 'components/ui/button'
import InviteUserModal from 'components/InviteUserModal'
import { accessTool } from 'tools'

const Page = () => {
  const t = useTranslations()
  const { userInfo } = useAuth()

  const canWriteUser = accessTool.isAllowedAccess(
    accessTool.Access.WriteUser,
    userInfo?.roles,
  )

  const [showInviteModal, setShowInviteModal] = useState(false)

  return (
    <section className='flex flex-col'>
      <Breadcrumb
        page={{ label: t('users.title') }}
        action={canWriteUser && (
          <Button
            variant='outline'
            size='sm'
            data-testid='inviteUserBtn'
            onClick={() => setShowInviteModal(true)}
          >
            <div className='flex items-center gap-2'>
              <PlusIcon className='w-4 h-4' />
              {t('users.invite')}
            </div>
          </Button>
        )}
      />
      <InviteUserModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvited={() => setShowInviteModal(false)}
      />
      <UserTable orgId={null} />
    </section>
  )
}

export default Page

'use client'

import { useAuth } from '@melody-auth/react'
import { useTranslations } from 'next-intl'
import useCurrentLocale from 'hooks/useCurrentLocale'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'
import { Button } from 'components/ui/button'
import Breadcrumb from 'components/Breadcrumb'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const configs = useSignalValue(configSignal)

  const { loginRedirect } = useAuth()

  const handleUpdateInfo = () => {
    loginRedirect({
      locale: locale || undefined, policy: 'update_info', org: 'default',
    })
  }

  const handleChangePassword = () => {
    loginRedirect({
      locale: locale || undefined, policy: 'change_password', org: 'default',
    })
  }

  const handleChangeEmail = () => {
    loginRedirect({
      locale: locale || undefined, policy: 'change_email', org: 'default',
    })
  }

  const handleResetMfa = () => {
    loginRedirect({
      locale: locale || undefined, policy: 'reset_mfa', org: 'default',
    })
  }

  const handleManagePasskey = () => {
    loginRedirect({
      locale: locale || undefined, policy: 'manage_passkey', org: 'default',
    })
  }

  return (
    <section className='flex flex-col gap-8'>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('layout.account') }}
      />
      <section className='flex flex-col gap-4 w-40'>
        <Button onClick={handleUpdateInfo}>
          {t('account.updateInfo')}
        </Button>
        <Button onClick={handleChangePassword}>
          {t('account.changePassword')}
        </Button>
        <Button onClick={handleChangeEmail}>
          {t('account.changeEmail')}
        </Button>
        <Button onClick={handleResetMfa}>
          {t('account.resetMfa')}
        </Button>
        {configs.ALLOW_PASSKEY_ENROLLMENT && (
          <Button onClick={handleManagePasskey}>
            {t('account.managePasskey')}
          </Button>
        )}
      </section>
    </section>
  )
}

export default Page

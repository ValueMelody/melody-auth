'use client'

import { useAuth } from '@melody-auth/react'
import { Button } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import useCurrentLocale from 'hooks/useCurrentLocale'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const configs = useSignalValue(configSignal)

  const { loginRedirect } = useAuth()

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
    <section className='flex flex-col gap-4 w-40'>
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
  )
}

export default Page

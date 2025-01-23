'use client'

import { useAuth } from '@melody-auth/react'
import { Button } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import useCurrentLocale from 'hooks/useCurrentLocale'

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

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
    </section>
  )
}

export default Page

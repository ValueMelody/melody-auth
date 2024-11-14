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
      locale: locale || undefined, policy: 'change_password',
    })
  }

  const handleChangeEmail = () => {
    loginRedirect({
      locale: locale || undefined, policy: 'change_email',
    })
  }

  return (
    <section className='flex flex-col gap-4 w-32'>
      <Button onClick={handleChangePassword}>
        {t('account.changePassword')}
      </Button>
      <Button onClick={handleChangeEmail}>
        {t('account.changeEmail')}
      </Button>
    </section>
  )
}

export default Page

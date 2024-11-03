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

  return (
    <section>
      <Button onClick={handleChangePassword}>
        {t('account.changePassword')}
      </Button>
    </section>
  )
}

export default Page

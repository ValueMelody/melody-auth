'use client'

import { useTranslations } from 'next-intl'
import UserTable from 'components/UserTable'
import Breadcrumb from 'components/Breadcrumb'

const Page = () => {
  const t = useTranslations()

  return (
    <section className='flex flex-col gap-8'>
      <Breadcrumb
        page={{ label: t('users.title') }}
      />
      <UserTable
        orgId={null}
      />
    </section>
  )
}

export default Page

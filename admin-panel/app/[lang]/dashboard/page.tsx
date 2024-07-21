'use client'

import { useTranslations } from 'next-intl'
import { Button } from 'flowbite-react'
import Link from 'next/link'
import useCurrentLocale from 'hooks/useCurrentLocale'
import { routeTool } from 'tools'

const Page = () => {
  const local = useCurrentLocale()
  const t = useTranslations()
  return (
    <section className='flex'>
      <Button
        size='sm'
        as={Link}
        href={`/${local}/${routeTool.Internal.Users}`}>
        {t('layout.users')}
      </Button>
    </section>
  )
}

export default Page

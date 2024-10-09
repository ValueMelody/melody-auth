import { PlusIcon } from '@heroicons/react/16/solid'
import { Button } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const CreateButton = ({ href }: {
  href: string;
}) => {
  const t = useTranslations()

  return (
    <Button
      as={Link}
      color='gray'
      href={href}
      size='sm'
      data-testid='createButton'
    >
      <div className='flex items-center gap-2'>
        <PlusIcon className='w-4 h-4' />
        {t('common.create')}
      </div>
    </Button>
  )
}

export default CreateButton

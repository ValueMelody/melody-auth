import { PlusIcon } from '@heroicons/react/16/solid'
import { useTranslations } from 'next-intl'
import { Link } from 'i18n/navigation'
import { Button } from 'components/ui/button'

const CreateButton = ({
  href, 'data-testid': testId,
}: {
  href: string;
  ['data-testid']?: string;
}) => {
  const t = useTranslations()

  return (
    <Button
      variant='outline'
      size='sm'
      data-testid={testId ?? 'createButton'}
      asChild
    >
      <Link href={href}>
        <div className='flex items-center gap-2'>
          <PlusIcon className='w-4 h-4' />
          {t('common.create')}
        </div>
      </Link>
    </Button>
  )
}

export default CreateButton

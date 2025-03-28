import { PencilSquareIcon } from '@heroicons/react/16/solid'
import Link from 'next/link'
import { Button } from 'components/ui/button'

const EditLink = ({ href }: {
  href: string;
}) => {
  return (
    <Button
      className='w-10'
      asChild
      variant='outline'
      data-testid='editLink'
    >
      <Link href={href}>
        <PencilSquareIcon className='w-4 h-4' />
      </Link>
    </Button>
  )
}

export default EditLink

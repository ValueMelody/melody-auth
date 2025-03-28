import { EyeIcon } from '@heroicons/react/16/solid'
import Link from 'next/link'
import { Button } from 'components/ui/button'

const ViewLink = ({ href }: {
  href: string;
}) => {
  return (
    <Button
      className='w-10'
      asChild
      variant='outline'
      size='sm'
    >
      <Link href={href}>
        <EyeIcon className='w-4 h-4' />
      </Link>
    </Button>
  )
}

export default ViewLink

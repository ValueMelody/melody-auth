import { PencilSquareIcon } from '@heroicons/react/16/solid'
import { Button } from 'flowbite-react'
import Link from 'next/link'

const EditLink = ({ href }: {
  href: string;
}) => {
  return (
    <Button
      className='w-10'
      as={Link}
      href={href}
      color='gray'
      size='sm'
      data-testid='editLink'
    >
      <PencilSquareIcon className='w-4 h-4' />
    </Button>
  )
}

export default EditLink

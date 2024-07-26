import { Badge } from 'flowbite-react'

const ClientTypeLabel = ({ type }: {
  type: string;
}) => {
  return (
    <div className='flex items-center'>
      <Badge>{type.toUpperCase()}</Badge>
    </div>
  )
}

export default ClientTypeLabel

import { Badge } from 'components/ui/badge'

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

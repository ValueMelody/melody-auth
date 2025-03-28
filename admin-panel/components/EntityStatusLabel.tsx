import { useTranslations } from 'next-intl'
import { Badge } from 'components/ui/badge'

const EntityStatusLabel = ({ isEnabled }: {
  isEnabled: boolean;
}) => {
  const t = useTranslations()

  return (
    <div className='items-center flex'>
      {
        isEnabled
          ? <Badge>{t('common.active')}</Badge>
          : <Badge variant='destructive'>{t('common.disabled')}</Badge>
      }
    </div>
  )
}

export default EntityStatusLabel

import { useTranslations } from 'next-intl'
import { Badge } from 'components/ui/badge'

const EntityStatusLabel = ({
  isEnabled, isInviting,
}: {
  isEnabled: boolean;
  isInviting?: boolean;
}) => {
  const t = useTranslations()

  return (
    <div className='items-center flex'>
      {isInviting
        ? <Badge variant='warning'>{t('common.inviting')}</Badge>
        : isEnabled
          ? <Badge>{t('common.active')}</Badge>
          : <Badge variant='destructive'>{t('common.disabled')}</Badge>
      }
    </div>
  )
}

export default EntityStatusLabel

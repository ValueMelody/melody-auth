import { useTranslations } from 'next-intl'
import { Badge } from 'components/ui/badge'

const BannerTypeLabel = ({ type }: {
  type: string;
}) => {
  const t = useTranslations()

  return (
    <div className='items-center flex'>
      {type === 'error' && <Badge variant='destructive'>{t('apps.error')}</Badge>}
      {type === 'info' && <Badge variant='info'>{t('apps.info')}</Badge>}
      {type === 'warning' && <Badge variant='warning'>{t('apps.warning')}</Badge>}
      {type === 'success' && <Badge variant='success'>{t('apps.success')}</Badge>}
    </div>
  )
}

export default BannerTypeLabel

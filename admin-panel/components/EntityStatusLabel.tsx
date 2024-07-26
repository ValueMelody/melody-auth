import { Badge } from 'flowbite-react'
import { useTranslations } from 'next-intl'

const EntityStatusLabel = ({ isEnabled }: {
  isEnabled: boolean;
}) => {
  const t = useTranslations()

  return (
    <div className='items-center flex'>
      {
        isEnabled
          ? <Badge color='success'>{t('common.active')}</Badge>
          : <Badge color='failure'>{t('common.disabled')}</Badge>
      }
    </div>
  )
}

export default EntityStatusLabel

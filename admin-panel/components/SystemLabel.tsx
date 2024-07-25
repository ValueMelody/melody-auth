import { Badge } from 'flowbite-react'
import { useTranslations } from 'next-intl'

const SystemLabel = () => {
  const t = useTranslations()

  return (
    <Badge color='gray'>{t('common.system')}</Badge>
  )
}

export default SystemLabel

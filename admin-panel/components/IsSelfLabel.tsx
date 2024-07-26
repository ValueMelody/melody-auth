import { Badge } from 'flowbite-react'
import { useTranslations } from 'next-intl'

const IsSelfLabel = () => {
  const t = useTranslations()

  return (
    <Badge>{t('users.you')}</Badge>
  )
}

export default IsSelfLabel

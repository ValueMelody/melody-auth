import { useTranslations } from 'next-intl'
import { Badge } from 'components/ui/badge'

const IsSelfLabel = () => {
  const t = useTranslations()

  return (
    <Badge>{t('users.you')}</Badge>
  )
}

export default IsSelfLabel

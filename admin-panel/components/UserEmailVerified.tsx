import { useTranslations } from 'next-intl'
import { Badge } from 'components/ui/badge'
import { UserDetail } from 'services/auth/api'

const UserEmailVerified = ({ user }: { user: UserDetail }) => {
  const t = useTranslations()
  return user.emailVerified
    ? (
      <Badge>
        {t('users.emailVerified')}
      </Badge>
    )
    : (
      <Badge variant='destructive'>
        {t('users.emailNotVerified')}
      </Badge>
    )
}

export default UserEmailVerified

import { Badge } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { UserDetail } from 'services/auth/api'

const UserEmailVerified = ({ user }: { user: UserDetail }) => {
  const t = useTranslations()
  return user.emailVerified
    ? (
      <Badge color='success'>
        {t('users.emailVerified')}
      </Badge>
    )
    : (
      <Badge color='failure'>
        {t('users.emailNotVerified')}
      </Badge>
    )
}

export default UserEmailVerified

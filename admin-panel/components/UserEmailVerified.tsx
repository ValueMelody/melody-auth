import { Badge } from 'flowbite-react'
import { useTranslations } from 'next-intl'

const UserEmailVerified = ({ user }) => {
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

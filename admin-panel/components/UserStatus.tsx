import { Badge } from 'flowbite-react'
import { useTranslations } from 'next-intl'

const UserStatus = ({ user }) => {
  const t = useTranslations()

  return (
    <div className='items-center flex'>
      {
        user.deletedAt
          ? <Badge color='failure'>{t('users.disabled')}</Badge>
          : <Badge color='success'>{t('users.active')}</Badge>
      }
    </div>
  )
}

export default UserStatus

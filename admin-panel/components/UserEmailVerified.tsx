import {
  CheckIcon, XMarkIcon,
} from '@heroicons/react/16/solid'

const UserEmailVerified = ({ user }) => {
  return user.emailVerified
    ? (
      <CheckIcon
        className='w-4 h-4'
        color='green'
      />
    )
    : (
      <XMarkIcon
        className='w-4 h-4'
        color='red'
      />
    )
}

export default UserEmailVerified

import {
  CheckIcon, XMarkIcon,
} from '@heroicons/react/16/solid'

const ConfigBooleanValue = ({ config }: { config?: boolean }) => {
  return config
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

export default ConfigBooleanValue

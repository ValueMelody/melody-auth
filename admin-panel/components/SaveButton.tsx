import {
  Button, Spinner,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'

const SaveButton = ({
  onClick,
  className,
  disabled = false,
  isLoading = false,
}: {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}) => {
  const t = useTranslations()

  return (
    <Button
      data-testid='saveButton'
      disabled={disabled || isLoading}
      className={className}
      onClick={onClick}
    >
      {t('common.save')}
      {isLoading && <Spinner className='ml-2' />}
    </Button>
  )
}

export default SaveButton

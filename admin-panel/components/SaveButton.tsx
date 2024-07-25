import classNames from 'classnames'
import { Button } from 'flowbite-react'
import { useTranslations } from 'next-intl'

const SaveButton = ({
  onClick,
  className,
  disabled = false,
}: {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const t = useTranslations()

  return (
    <Button
      disabled={disabled}
      className={classNames(
        className,
        'mt-6',
      )}
      onClick={onClick}
    >
      {t('common.save')}
    </Button>
  )
}

export default SaveButton

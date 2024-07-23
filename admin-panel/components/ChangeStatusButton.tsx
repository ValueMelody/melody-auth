import { Button } from 'flowbite-react'
import { useTranslations } from 'next-intl'

export const ChangeStatusButton = ({
  isEnabled,
  onEnable,
  onDisable,
}: {
  isEnabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
}) => {
  const t = useTranslations()

  return (
    <Button
      size='xs'
      onClick={isEnabled ? onDisable : onEnable }>
      {isEnabled ? t('common.disable') : t('common.enable')}
    </Button>
  )
}

export default ChangeStatusButton

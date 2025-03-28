import { useTranslations } from 'next-intl'
import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import { Spinner } from 'components/ui/spinner'
import { Button } from 'components/ui/button'

const DeleteButton = ({
  className,
  confirmDeleteTitle,
  onConfirmDelete,
  isLoading,
  disabled,
  buttonText,
  size,
}: {
  size?: 'sm' | 'default';
  className?: string;
  buttonText?: string;
  confirmDeleteTitle: string;
  onConfirmDelete: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) => {
  const t = useTranslations()
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <>
      <ConfirmModal
        title={confirmDeleteTitle}
        show={showModal}
        onConfirm={onConfirmDelete}
        onClose={handleCloseModal}
        confirmButtonText={buttonText}
      />
      <Button
        data-testid='deleteButton'
        disabled={isLoading || disabled}
        className={className}
        onClick={handleClick}
        size={size}
        variant='outline'
      >
        {buttonText || t('common.delete')}
        {isLoading && <Spinner />}
      </Button>
    </>
  )
}

export default DeleteButton

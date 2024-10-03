import {
  Button, Spinner,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import ConfirmModal from './ConfirmModal'

const DeleteButton = ({
  className,
  confirmDeleteTitle,
  onConfirmDelete,
  isLoading,
  disabled,
  buttonText,
  size,
}: {
  size?: 'sm' | 'xs';
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
        disabled={isLoading || disabled}
        className={className}
        onClick={handleClick}
        size={size}
        color='light'
      >
        {buttonText || t('common.delete')}
        {isLoading && <Spinner className='ml-2' />}
      </Button>
    </>
  )
}

export default DeleteButton

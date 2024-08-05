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
}: {
  className?: string;
  confirmDeleteTitle: string;
  onConfirmDelete: () => void;
  isLoading?: boolean;
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
        onClose={handleCloseModal} />
      <Button
        disabled={isLoading}
        className={className}
        onClick={handleClick}
        color='light'
      >
        {t('common.delete')}
        {isLoading && <Spinner className='ml-2' />}
      </Button>
    </>
  )
}

export default DeleteButton

import {
  Button, Modal,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'

const ConfirmModal = ({
  show,
  title,
  onClose,
  onConfirm,
  confirmButtonText,
}: {
  show: boolean;
  title: string;
  confirmButtonText?: string;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const t = useTranslations()

  return (
    <Modal
      show={show}
      onClose={onClose}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Footer>
        <Button
          color='failure'
          onClick={onConfirm}>
          {confirmButtonText || t('common.deleteConfirmBtn')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal

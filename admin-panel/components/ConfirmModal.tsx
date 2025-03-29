import { useTranslations } from 'next-intl'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogFooter,
  AlertDialogTitle, AlertDialogHeader, AlertDialogContent,
  AlertDialogDescription,
} from 'components/ui/alert-dialog'

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
    <AlertDialog open={show}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <VisuallyHidden>
          <AlertDialogDescription>
            {title}
          </AlertDialogDescription>
        </VisuallyHidden>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            data-testid='confirmButton'>
            {confirmButtonText || t('common.deleteConfirmBtn')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmModal

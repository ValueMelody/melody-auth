import { useTranslations } from 'next-intl'
import {
  useEffect, useState,
} from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogCancel, AlertDialogDescription,
} from 'components/ui/alert-dialog'
import {
  InviteLocaleField, InviteRedirectFields,
} from 'components/InviteDeliveryFields'
import { Button } from 'components/ui/button'
import SubmitError from 'components/SubmitError'
import { App } from 'services/auth/api'

const getDefaultLocale = (
  supportedLocales: string[],
  defaultLocale?: string,
) => {
  if (defaultLocale && supportedLocales.includes(defaultLocale)) return defaultLocale
  if (supportedLocales.length > 0) return supportedLocales[0]
  return defaultLocale ?? ''
}

const ResendInviteModal = ({
  show,
  isLoading,
  defaultLocale,
  supportedLocales,
  spaApps,
  onClose,
  onConfirm,
}: {
  show: boolean;
  isLoading: boolean;
  defaultLocale?: string;
  supportedLocales: string[];
  spaApps: App[];
  onClose: () => void;
  onConfirm: (body: { locale?: string; signinUrl?: string }) => Promise<void>;
}) => {
  const t = useTranslations()

  const [locale, setLocale] = useState(
    getDefaultLocale(supportedLocales, defaultLocale),
  )
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [signinUrl, setSigninUrl] = useState('')

  useEffect(
    () => {
      if (!show) return
      setLocale(getDefaultLocale(supportedLocales, defaultLocale))
      setSelectedAppId(null)
      setSigninUrl('')
    },
    [defaultLocale, show, supportedLocales],
  )

  const handleClose = () => {
    setLocale(getDefaultLocale(supportedLocales, defaultLocale))
    setSelectedAppId(null)
    setSigninUrl('')
    onClose()
  }

  const handleConfirm = async () => {
    await onConfirm({
      locale: locale || undefined,
      signinUrl: signinUrl || undefined,
    })
  }

  return (
    <AlertDialog open={show}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('users.resendInvite')}</AlertDialogTitle>
        </AlertDialogHeader>
        <VisuallyHidden>
          <AlertDialogDescription>
            {t('users.inviteRedirectDesc')}
          </AlertDialogDescription>
        </VisuallyHidden>
        <section className='flex flex-col gap-4'>
          <InviteLocaleField
            locale={locale}
            supportedLocales={supportedLocales}
            testIdPrefix='resendInvite'
            onLocaleChange={setLocale}
          />
          <InviteRedirectFields
            selectedAppId={selectedAppId}
            signinUrl={signinUrl}
            spaApps={spaApps}
            testIdPrefix='resendInvite'
            onSelectedAppIdChange={setSelectedAppId}
            onSigninUrlChange={setSigninUrl}
          />
        </section>
        <SubmitError />
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </AlertDialogCancel>
          <Button
            data-testid='confirmResendInvite'
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {t('users.resendInvite')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ResendInviteModal

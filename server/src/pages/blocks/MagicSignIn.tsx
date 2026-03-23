import { SubmitError, ViewTitle } from 'pages/components'
import { magicSignIn } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface MagicSignInProps {
  locale: typeConfig.Locale;
  isProcessing: boolean;
  isSuccess: boolean;
  error: string | null;
}

const MagicSignIn = ({
  locale,
  isProcessing,
  isSuccess,
  error,
}: MagicSignInProps) => {
  const title = isProcessing
    ? magicSignIn.processing[locale]
    : isSuccess
      ? magicSignIn.success[locale]
      : magicSignIn.invalid[locale]

  return (
    <>
      <ViewTitle title={title} />
      {error && !isProcessing && (
        <SubmitError error={error === 'invalid' ? magicSignIn.invalid[locale] : error} />
      )}
    </>
  )
}

export default MagicSignIn

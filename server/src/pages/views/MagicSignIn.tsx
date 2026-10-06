import { typeConfig } from 'configs'
import {
  useMagicSignInForm, useSubmitError, View,
} from 'pages/hooks'
import { MagicSignIn as MagicSignInBlock } from 'pages/blocks'

export interface MagicSignInProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const MagicSignIn = ({
  locale,
  onSwitchView,
}: MagicSignInProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    isProcessing,
    isSuccess,
    error,
  } = useMagicSignInForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  return (
    <MagicSignInBlock
      locale={locale}
      isProcessing={isProcessing}
      isSuccess={isSuccess}
      error={error}
      submitError={submitError}
    />
  )
}

export default MagicSignIn

import { typeConfig } from 'configs'
import {
  useMagicSignInForm, View,
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
    isProcessing,
    isSuccess,
    error,
  } = useMagicSignInForm({
    locale,
    onSwitchView,
  })

  return (
    <MagicSignInBlock
      locale={locale}
      isProcessing={isProcessing}
      isSuccess={isSuccess}
      error={error}
    />
  )
}

export default MagicSignIn

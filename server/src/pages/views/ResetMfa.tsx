import { typeConfig } from 'configs'
import {
  View,
  useSubmitError,
  useResetMfaForm,
} from 'pages/hooks'
import { ResetMfa as ResetMfaBlock } from 'pages/blocks'

export interface ResetMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ResetMfa = ({
  locale,
  onSwitchView,
}: ResetMfaProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    handleSubmit,
    success,
    redirectUri,
    isSubmitting,
  } = useResetMfaForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <ResetMfaBlock
      locale={locale}
      success={success}
      onSubmit={handleSubmit}
      submitError={submitError}
      redirectUri={redirectUri}
      isSubmitting={isSubmitting}
    />
  )
}

export default ResetMfa

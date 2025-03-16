import { typeConfig } from 'configs'
import {
  useChangeEmailForm, useSubmitError,
} from 'pages/hooks'
import { View } from 'pages/hooks/useCurrentView'
import { ChangeEmail as ChangeEmailBlock } from 'pages/blocks'

interface ChangeEmailProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ChangeEmail = ({
  locale,
  onSwitchView,
}: ChangeEmailProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    success,
    redirectUri,
    resent,
    handleResend,
  } = useChangeEmailForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <ChangeEmailBlock
      locale={locale}
      success={success}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      redirectUri={redirectUri}
      resent={resent}
      handleResend={handleResend}
    />
  )
}

export default ChangeEmail

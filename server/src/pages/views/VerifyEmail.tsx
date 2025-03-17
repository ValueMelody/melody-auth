import { typeConfig } from 'configs'
import {
  useSubmitError, useVerifyEmailForm, View,
} from 'pages/hooks'
import { VerifyEmail as VerifyEmailBlock } from 'pages/blocks'

export interface VerifyEmailProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const VerifyEmail = ({
  locale,
  onSwitchView,
}: VerifyEmailProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    success,
    handleSubmit,
    handleChange,
    values,
    errors,
  } = useVerifyEmailForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <VerifyEmailBlock
      success={success}
      locale={locale}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
    />
  )
}

export default VerifyEmail

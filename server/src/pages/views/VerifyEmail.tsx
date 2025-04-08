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
    isSubmitting,
  } = useVerifyEmailForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <VerifyEmailBlock
      success={success}
      locale={locale}
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      isSubmitting={isSubmitting}
    />
  )
}

export default VerifyEmail

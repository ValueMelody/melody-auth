import { typeConfig } from 'configs'
import {
  useResetPasswordForm, useSubmitError,
} from 'pages/hooks'
import { View } from 'pages/hooks/useCurrentView'
import { ResetPassword as ResetPasswordBlock } from 'pages/blocks'
export interface ResetPasswordProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ResetPassword = ({
  locale,
  onSwitchView,
}: ResetPasswordProps) => {
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
    handleResend,
    resent,
    success,
  } = useResetPasswordForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <ResetPasswordBlock
      locale={locale}
      success={success}
      handleSubmit={handleSubmit}
      submitError={submitError}
      onSwitchView={onSwitchView}
      values={values}
      errors={errors}
      handleChange={handleChange}
      handleResend={handleResend}
      resent={resent}
    />
  )
}

export default ResetPassword

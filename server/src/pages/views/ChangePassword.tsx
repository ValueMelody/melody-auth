import { typeConfig } from 'configs'
import {
  useChangePasswordForm, View,
  useSubmitError,
} from 'pages/hooks'
import { ChangePassword as ChangePasswordBlock } from 'pages/blocks'

export interface ChangePasswordProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ChangePassword = ({
  locale,
  onSwitchView,
}: ChangePasswordProps) => {
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
    isSubmitting,
  } = useChangePasswordForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <ChangePasswordBlock
      locale={locale}
      success={success}
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      redirectUri={redirectUri}
      isSubmitting={isSubmitting}
    />
  )
}

export default ChangePassword

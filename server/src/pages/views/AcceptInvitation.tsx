import { typeConfig } from 'configs'
import {
  useAcceptInvitationForm, useSubmitError, View,
} from 'pages/hooks'
import { AcceptInvitation as AcceptInvitationBlock } from 'pages/blocks'

export interface AcceptInvitationProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const AcceptInvitation = ({
  locale,
  onSwitchView,
}: AcceptInvitationProps) => {
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
    isTokenValid,
    signinUrl,
  } = useAcceptInvitationForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <AcceptInvitationBlock
      success={success}
      locale={locale}
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      isSubmitting={isSubmitting}
      isTokenValid={isTokenValid}
      signinUrl={signinUrl}
    />
  )
}

export default AcceptInvitation

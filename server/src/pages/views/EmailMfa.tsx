import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  useEmailMfaForm, useInitialProps, useSubmitError, View,
} from 'pages/hooks'
import { EmailMfa as EmailMfaBlock } from 'pages/blocks'

export interface EmailMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const EmailMfa = ({
  locale,
  onSwitchView,
}: EmailMfaProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const { initialProps } = useInitialProps()

  const {
    resent, values, errors, handleChange, sendEmailMfa, handleSubmit, isSubmitting, isSending,
  } = useEmailMfaForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      sendEmailMfa()
    },
    [sendEmailMfa],
  )

  return (
    <EmailMfaBlock
      locale={locale}
      resent={resent}
      sendEmailMfa={sendEmailMfa}
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      isSubmitting={isSubmitting}
      isSending={isSending}
      initialProps={initialProps}
    />
  )
}

export default EmailMfa

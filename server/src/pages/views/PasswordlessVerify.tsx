import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  usePasswordlessVerifyForm, useSubmitError, View,
} from 'pages/hooks'
import { PasswordlessVerify as PasswordlessVerifyBlock } from 'pages/blocks'

export interface PasswordlessVerifyProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const PasswordlessVerify = ({
  locale,
  onSwitchView,
}: PasswordlessVerifyProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    resent, values, errors, handleChange, sendPasswordlessCode, handleSubmit,
  } = usePasswordlessVerifyForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      sendPasswordlessCode()
    },
    [sendPasswordlessCode],
  )

  return (
    <PasswordlessVerifyBlock
      errors={errors}
      locale={locale}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      resent={resent}
      values={values}
      submitError={submitError}
      sendPasswordlessCode={sendPasswordlessCode}
    />
  )
}

export default PasswordlessVerify

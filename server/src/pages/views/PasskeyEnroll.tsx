import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  usePasskeyEnrollForm, useSubmitError, View,
} from 'pages/hooks'
import { PasskeyEnroll as PasskeyEnrollBlock } from 'pages/blocks'

export interface PasskeyEnrollProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const PasskeyEnroll = ({
  locale,
  onSwitchView,
}: PasskeyEnrollProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    onSwitchView,
    locale,
  })

  const {
    getEnrollOptions,
    rememberSkip,
    handleRememberSkip,
    handleEnroll,
    handleDecline,
    isEnrolling,
    isDeclining,
  } = usePasskeyEnrollForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getEnrollOptions()
    },
    [getEnrollOptions],
  )

  return (
    <PasskeyEnrollBlock
      locale={locale}
      onDecline={handleDecline}
      onEnroll={handleEnroll}
      submitError={submitError}
      rememberSkip={rememberSkip}
      onRememberSkip={handleRememberSkip}
      isEnrolling={isEnrolling}
      isDeclining={isDeclining}
    />
  )
}

export default PasskeyEnroll

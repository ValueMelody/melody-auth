import { useEffect } from 'hono/jsx'
import {
  useSubmitError, View,
} from 'pages/hooks'
import { typeConfig } from 'configs'
import useRecoveryCodeEnrollForm from 'pages/hooks/useRecoveryCodeEnrollForm'
import { RecoveryCodeEnroll as RecoveryCodeEnrollBlock } from 'pages/blocks'

export interface RecoveryCodeEnrollProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const RecoveryCodeEnroll = ({
  locale,
  onSwitchView,
}: RecoveryCodeEnrollProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    getRecoveryCodeEnrollInfo,
    recoveryCodeEnrollInfo,
    handleContinue,
  } = useRecoveryCodeEnrollForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getRecoveryCodeEnrollInfo()
    },
    [getRecoveryCodeEnrollInfo],
  )

  return (
    <RecoveryCodeEnrollBlock
      locale={locale}
      recoveryCodeEnrollInfo={recoveryCodeEnrollInfo}
      handleContinue={handleContinue}
      submitError={submitError}
    />
  )
}

export default RecoveryCodeEnroll

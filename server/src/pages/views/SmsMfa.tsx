import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  useSubmitError, useSmsMfaForm, View,
} from 'pages/hooks'
import { SmsMfa as SmsMfaBlock } from 'pages/blocks'
export interface SmsMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const SmsMfa = ({
  locale,
  onSwitchView,
}: SmsMfaProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    getSmsMfaInfo,
    currentNumber,
    allowFallbackToEmailMfa,
    countryCode,
    values,
    errors,
    handleChange,
    handleSubmit,
    handleResend,
    resent,
  } = useSmsMfaForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getSmsMfaInfo()
    },
    [getSmsMfaInfo],
  )

  return (
    <SmsMfaBlock
      locale={locale}
      onSwitchView={onSwitchView}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      currentNumber={currentNumber}
      countryCode={countryCode}
      allowFallbackToEmailMfa={allowFallbackToEmailMfa}
      resent={resent}
      handleResend={handleResend}
    />
  )
}

export default SmsMfa

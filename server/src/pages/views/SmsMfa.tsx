import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  useSubmitError, useSmsMfaForm, View,
  useInitialProps,
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

  const { initialProps } = useInitialProps()

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
    isSubmitting,
    isSending,
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
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      currentNumber={currentNumber}
      countryCode={countryCode}
      allowFallbackToEmailMfa={allowFallbackToEmailMfa}
      resent={resent}
      onResend={handleResend}
      isSubmitting={isSubmitting}
      isSending={isSending}
      initialProps={initialProps}
    />
  )
}

export default SmsMfa

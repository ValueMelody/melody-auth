import { useEffect } from 'hono/jsx'
import {
  useSubmitError, View, useOtpMfaForm,
} from 'pages/hooks'
import { typeConfig } from 'configs'
import { OtpMfa as OtpMfaBlock } from 'pages/blocks'

export interface OtpMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const OtpMfa = ({
  locale,
  onSwitchView,
}: OtpMfaProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    allowFallbackToEmailMfa,
    getOtpMfaInfo,
    handleMfa,
    errors,
    values,
    handleChange,
  } = useOtpMfaForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getOtpMfaInfo()
    },
    [getOtpMfaInfo],
  )

  return (
    <OtpMfaBlock
      locale={locale}
      handleChange={handleChange}
      handleMfa={handleMfa}
      submitError={submitError}
      allowFallbackToEmailMfa={allowFallbackToEmailMfa}
      onSwitchView={onSwitchView}
      values={values}
      errors={errors}
    />
  )
}

export default OtpMfa

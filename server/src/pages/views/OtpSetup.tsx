import {
  useEffect, useRef,
} from 'hono/jsx'
import { toCanvas } from 'qrcode'
import {
  useSubmitError, View, useOtpMfaForm,
} from 'pages/hooks'
import { typeConfig } from 'configs'
import { OtpSetup as OtpSetupBlock } from 'pages/blocks'

export interface OtpSetupProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const OtpSetup = ({
  locale,
  onSwitchView,
}: OtpSetupProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    otpUri,
    getOtpSetupInfo,
    handleMfa,
    errors,
    values,
    handleChange,
  } = useOtpMfaForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  const qrCodeEl = useRef<HTMLCanvasElement>(null)

  useEffect(
    () => {
      getOtpSetupInfo()
    },
    [getOtpSetupInfo],
  )

  useEffect(
    () => {
      if (qrCodeEl && qrCodeEl.current && otpUri) {
        toCanvas(
          qrCodeEl.current,
          otpUri,
        )
      }
    },
    [otpUri, qrCodeEl],
  )

  return (
    <OtpSetupBlock
      locale={locale}
      otpUri={otpUri}
      qrCodeEl={qrCodeEl}
      handleChange={handleChange}
      handleMfa={handleMfa}
      submitError={submitError}
      values={values}
      errors={errors}
    />
  )
}

export default OtpSetup

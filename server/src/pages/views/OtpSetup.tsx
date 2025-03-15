import {
  useEffect, useRef,
} from 'hono/jsx'
import { toCanvas } from 'qrcode'
import {
  useSubmitError, View, useOtpMfaForm,
} from 'pages/hooks'
import { typeConfig } from 'configs'
import {
  SubmitError, CodeInput, PrimaryButton, ViewTitle,
} from 'pages/components'
import { otpMfa } from 'pages/tools/locale'

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
    <>
      <script src='https://unpkg.com/qrcode@1.4.1/build/qrcode.js'></script>
      {otpUri && (
        <>
          <ViewTitle
            title={otpMfa.setup[locale]}
          />
          <canvas ref={qrCodeEl} />
        </>
      )}
      <CodeInput
        label={otpMfa.code[locale]}
        required={true}
        code={values.mfaCode}
        setCode={(code) => {
          handleChange(
            'mfaCode',
            code,
          )
        }}
        error={errors.mfaCode}
      />
      <SubmitError error={submitError} />
      <PrimaryButton
        className='w-(--text-width)'
        type='button'
        title={otpMfa.verify[locale]}
        onClick={handleMfa}
      />
    </>
  )
}

export default OtpSetup

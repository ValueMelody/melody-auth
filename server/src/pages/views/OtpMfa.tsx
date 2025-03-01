import { useEffect } from 'hono/jsx'
import {
  useSubmitError, View, useOtpMfaForm,
} from 'pages/hooks'
import {
  localeConfig, typeConfig,
} from 'configs'
import {
  SubmitError, CodeInput, PrimaryButton, ViewTitle, SecondaryButton,
} from 'pages/components'

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
    <>
      <ViewTitle
        title={localeConfig.authorizeOtpMfa.code[locale]}
      />
      <CodeInput
        required
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
        title={localeConfig.authorizeOtpMfa.verify[locale]}
        onClick={handleMfa}
      />
      {allowFallbackToEmailMfa && (
        <SecondaryButton
          title={localeConfig.authorizeOtpMfa.switchToEmail[locale]}
          onClick={() => onSwitchView(View.EmailMfa)}
        />
      )}
    </>
  )
}

export default OtpMfa

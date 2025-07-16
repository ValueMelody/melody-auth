import {
  SecondaryButton, PrimaryButton, SubmitError, CodeInput, ViewTitle, CheckboxInput,
} from 'pages/components'

import { otpMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'
import {
  InitialProps, View,
} from 'pages/hooks'

export interface OtpMfaProps {
  locale: typeConfig.Locale;
  onChange: (name: 'mfaCode' | 'rememberDevice', value: string[] | boolean) => void;
  onVerifyMfa: (e: Event) => void;
  submitError: string | null;
  allowFallbackToEmailMfa: boolean;
  onSwitchView: (view: View) => void;
  values: {
    mfaCode: string[];
    rememberDevice: boolean;
  };
  errors: {
    mfaCode: string | undefined;
  };
  isVerifyingMfa: boolean;
  initialProps: InitialProps;
}

const OtpMfa = ({
  locale,
  onChange,
  onVerifyMfa,
  submitError,
  allowFallbackToEmailMfa,
  onSwitchView,
  values,
  errors,
  isVerifyingMfa,
  initialProps,
}: OtpMfaProps) => {
  return (
    <>
      <ViewTitle
        title={otpMfa.code[locale]}
      />
      <CodeInput
        required
        code={values.mfaCode}
        setCode={(code) => {
          onChange(
            'mfaCode',
            code,
          )
        }}
        error={errors.mfaCode}
      />
      {initialProps.enableMfaRememberDevice && (
        <CheckboxInput
          id='rememberDevice'
          label={otpMfa.rememberDevice[locale]}
          checked={values.rememberDevice}
          onChange={(value) => onChange(
            'rememberDevice',
            value,
          )}
        />
      )}
      <SubmitError error={submitError} />
      <PrimaryButton
        className='w-(--text-width)'
        type='button'
        title={otpMfa.verify[locale]}
        onClick={onVerifyMfa}
        isLoading={isVerifyingMfa}
      />
      {allowFallbackToEmailMfa && (
        <SecondaryButton
          title={otpMfa.switchToEmail[locale]}
          onClick={() => onSwitchView(View.EmailMfa)}
        />
      )}
    </>
  )
}

export default OtpMfa

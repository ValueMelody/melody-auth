import {
  SecondaryButton, PrimaryButton, SubmitError, CodeInput, ViewTitle,
} from 'pages/components'

import { otpMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'
import { View } from 'pages/hooks'

export interface OtpMfaProps {
  locale: typeConfig.Locale;
  onChange: (name: 'mfaCode', value: string[]) => void;
  onVerifyMfa: (e: Event) => void;
  submitError: string | null;
  allowFallbackToEmailMfa: boolean;
  onSwitchView: (view: View) => void;
  values: {
    mfaCode: string[];
  };
  errors: {
    mfaCode: string | undefined;
  };
  isVerifyingMfa: boolean;
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

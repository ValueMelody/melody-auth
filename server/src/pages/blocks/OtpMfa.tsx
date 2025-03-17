import {
  SecondaryButton, PrimaryButton, SubmitError, CodeInput, ViewTitle,
} from 'pages/components'

import { otpMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'
import { View } from 'pages/hooks'

export interface OtpMfaProps {
  locale: typeConfig.Locale;
  handleChange: (name: 'mfaCode', value: string[]) => void;
  handleMfa: (e: Event) => void;
  submitError: string | null;
  allowFallbackToEmailMfa: boolean;
  onSwitchView: (view: View) => void;
  values: {
    mfaCode: string[];
  };
  errors: {
    mfaCode: string | undefined;
  };
}

const OtpMfa = ({
  locale,
  handleChange,
  handleMfa,
  submitError,
  allowFallbackToEmailMfa,
  onSwitchView,
  values,
  errors,
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

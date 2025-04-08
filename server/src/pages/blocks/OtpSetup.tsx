import {
  CodeInput, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'

import { otpMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface OtpSetupProps {
  locale: typeConfig.Locale;
  otpUri: string;
  qrCodeEl: React.RefObject<HTMLCanvasElement>;
  onChange: (name: 'mfaCode', value: string[]) => void;
  onVerifyMfa: (e: Event) => void;
  submitError: string | null;
  values: {
    mfaCode: string[];
  };
  errors: {
    mfaCode: string | undefined;
  };
  isVerifyingMfa: boolean;
}

const OtpSetup = ({
  locale,
  otpUri,
  qrCodeEl,
  onChange,
  onVerifyMfa,
  submitError,
  values,
  errors,
  isVerifyingMfa,
}: OtpSetupProps) => {
  return (
    <>
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
    </>
  )
}

export default OtpSetup

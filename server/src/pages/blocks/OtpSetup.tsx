import {
  CodeInput, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'

import { otpMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'

interface OtpSetupProps {
  locale: typeConfig.Locale;
  otpUri: string;
  qrCodeEl: React.RefObject<HTMLCanvasElement>;
  handleChange: (name: 'mfaCode', value: string[]) => void;
  handleMfa: (e: Event) => void;
  submitError: string | null;
  values: {
    mfaCode: string[];
  };
  errors: {
    mfaCode: string | undefined;
  };
}

const OtpSetup = ({
  locale,
  otpUri,
  qrCodeEl,
  handleChange,
  handleMfa,
  submitError,
  values,
  errors,
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

import { useState } from 'hono/jsx'
import {
  CodeInput, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'

import { otpMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface OtpSetupProps {
  locale: typeConfig.Locale;
  otpSecret: string;
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
  otpSecret,
  qrCodeEl,
  onChange,
  onVerifyMfa,
  submitError,
  values,
  errors,
  isVerifyingMfa,
}: OtpSetupProps) => {
  const [showKey, setShowKey] = useState(false)

  const handleShowKey = () => {
    setShowKey(true)
  }

  return (
    <>
      {otpUri && (
        <>
          <ViewTitle
            title={otpMfa.setup[locale]}
          />
          <canvas ref={qrCodeEl} />
          <section className='flex flex-col mb-6 items-center'>
            {!showKey && (
              <button
                type='button'
                onClick={handleShowKey}
                className='w-(--text-width) text-center underline text-blue-500'>
                {otpMfa.manual[locale]}
              </button>
            )}
            {showKey && (
              <div className='flex flex-col gap-2 items-center w-(--text-width) text-center'>
                <p>
                  {otpMfa.yourKey[locale]}
                </p>
                <a
                  href={otpUri}
                  className='underline text-center break-all text-blue-500'
                >
                  {otpSecret}
                </a>
              </div>
            )}
          </section>
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

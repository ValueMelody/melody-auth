import {
  PrimaryButton, SubmitError, ViewTitle, SecondaryButton, CodeInput,
} from 'pages/components'
import { passwordlessCode } from 'pages/tools/locale'
import { typeConfig } from 'configs'

interface PasswordlessVerifyProps {
  locale: typeConfig.Locale;
  handleSubmit: (e: Event) => void;
  handleChange: (name: 'mfaCode', value: string[]) => void;
  resent: boolean;
  values: {
    mfaCode: string[];
  };
  errors: {
    mfaCode: string | undefined;
  };
  submitError: string | null;
  sendPasswordlessCode: (resend: boolean) => void;
}

const PasswordlessVerify = ({
  locale,
  handleSubmit,
  handleChange,
  sendPasswordlessCode,
  resent,
  values,
  errors,
  submitError,
}: PasswordlessVerifyProps) => {
  return (
    <>
      <ViewTitle
        title={passwordlessCode.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <SecondaryButton
            title={resent
              ? passwordlessCode.resent[locale]
              : passwordlessCode.resend[locale]
            }
            disabled={resent}
            onClick={() => sendPasswordlessCode(true)}
          />
          <CodeInput
            label={passwordlessCode.code[locale]}
            required
            code={values.mfaCode ?? []}
            error={errors.mfaCode}
            setCode={(value) => handleChange(
              'mfaCode',
              value,
            )}
          />
          <SubmitError error={submitError} />
          <PrimaryButton
            title={passwordlessCode.verify[locale]}
            type='submit'
          />
        </section>
      </form>
    </>
  )
}

export default PasswordlessVerify

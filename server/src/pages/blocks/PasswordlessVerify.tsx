import {
  PrimaryButton, SubmitError, ViewTitle, SecondaryButton, CodeInput,
} from 'pages/components'
import { passwordlessCode } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface PasswordlessVerifyProps {
  locale: typeConfig.Locale;
  onSubmit: (e: Event) => void;
  onChange: (name: 'mfaCode', value: string[]) => void;
  resent: boolean;
  values: {
    mfaCode: string[];
  };
  errors: {
    mfaCode: string | undefined;
  };
  submitError: string | null;
  sendPasswordlessCode: (resend: boolean) => void;
  isSubmitting: boolean;
  isSending: boolean;
}

const PasswordlessVerify = ({
  locale,
  onSubmit,
  onChange,
  sendPasswordlessCode,
  resent,
  values,
  errors,
  submitError,
  isSubmitting,
  isSending,
}: PasswordlessVerifyProps) => {
  return (
    <>
      <ViewTitle
        title={passwordlessCode.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={onSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <SecondaryButton
            title={resent
              ? passwordlessCode.resent[locale]
              : passwordlessCode.resend[locale]
            }
            disabled={resent}
            isLoading={isSending}
            onClick={() => sendPasswordlessCode(true)}
          />
          <CodeInput
            label={passwordlessCode.code[locale]}
            required
            code={values.mfaCode ?? []}
            error={errors.mfaCode}
            setCode={(value) => onChange(
              'mfaCode',
              value,
            )}
          />
          <SubmitError error={submitError} />
          <PrimaryButton
            title={passwordlessCode.verify[locale]}
            type='submit'
            isLoading={isSubmitting}
          />
        </section>
      </form>
    </>
  )
}

export default PasswordlessVerify

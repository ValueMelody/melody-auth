import {
  PrimaryButton, SubmitError, CodeInput, SuccessMessage, ViewTitle,
} from 'pages/components'
import { verifyEmail } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface VerifyEmailProps {
  success: boolean;
  locale: typeConfig.Locale;
  onSubmit: (e: Event) => void;
  onChange: (name: 'mfaCode', value: string[]) => void;
  values: { mfaCode: string[] };
  errors: { mfaCode: string | undefined };
  submitError: string | null;
  isSubmitting: boolean;
}

const VerifyEmail = ({
  success,
  locale,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  isSubmitting,
}: VerifyEmailProps) => {
  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={verifyEmail.success[locale]}
          />
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={verifyEmail.title[locale]} />
          <p class='mb-2 w-(--text-width) text-center'>
            {verifyEmail.desc[locale]}
          </p>
          <form
            onSubmit={onSubmit}
          >
            <section className='flex flex-col gap-2'>
              <CodeInput
                required
                code={values.mfaCode}
                setCode={(code) => onChange(
                  'mfaCode',
                  code,
                )}
                error={errors.mfaCode}
              />
              <SubmitError
                error={submitError}
              />
              <PrimaryButton
                className='mt-4'
                type='submit'
                title={verifyEmail.verify[locale]}
                isLoading={isSubmitting}
              />
            </section>
          </form>
        </>
      )}
    </>
  )
}

export default VerifyEmail

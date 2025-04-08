import { typeConfig } from 'configs'
import { changeEmail } from 'pages/tools/locale'
import {
  SuccessMessage, ViewTitle, Field, SecondaryButton, CodeInput, SubmitError, PrimaryButton,
} from 'pages/components'

export interface ChangeEmailProps {
  locale: typeConfig.Locale;
  success: boolean;
  onSubmit: (e: Event) => void;
  onChange: (name: 'email' | 'mfaCode', value: string | string[]) => void;
  values: { email: string; mfaCode: string[] | null };
  errors: { email: string | undefined; mfaCode: string | undefined };
  submitError: string | null;
  redirectUri: string;
  resent: boolean;
  onResend: () => void;
  isSubmitting: boolean;
  isResending: boolean;
}

const ChangeEmail = ({
  locale,
  success,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  redirectUri,
  resent,
  onResend,
  isSubmitting,
  isResending,
}: ChangeEmailProps) => {
  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={changeEmail.success[locale]}
          />
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={changeEmail.title[locale]} />
          <form
            autoComplete='on'
            onSubmit={onSubmit}
          >
            <section className='flex flex-col gap-2'>
              <Field
                label={changeEmail.email[locale]}
                type='email'
                required
                value={values.email}
                name='email'
                autoComplete='email'
                error={errors.email}
                onChange={(value) => onChange(
                  'email',
                  value,
                )}
              />
              {values.mfaCode !== null && (
                <>
                  <SecondaryButton
                    title={resent
                      ? changeEmail.resent[locale]
                      : changeEmail.resend[locale]
                    }
                    isLoading={isResending}
                    onClick={onResend}
                    disabled={resent}
                  />
                  <CodeInput
                    label={changeEmail.code[locale]}
                    required
                    code={values.mfaCode}
                    setCode={(code) => onChange(
                      'mfaCode',
                      code,
                    )}
                    error={errors.mfaCode}
                  />
                </>
              )}
              <SubmitError error={submitError} />
              <PrimaryButton
                className='mt-4'
                type='submit'
                isLoading={isSubmitting}
                title={
                  values.mfaCode !== null
                    ? changeEmail.confirm[locale]
                    : changeEmail.sendCode[locale]
                }
              />
            </section>
          </form>
        </>
      )}
      <a
        className='mt-6 text-center'
        href={redirectUri}
      >
        {changeEmail.redirect[locale]}
      </a>
    </>
  )
}

export default ChangeEmail

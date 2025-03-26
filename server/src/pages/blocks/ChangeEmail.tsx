import { typeConfig } from 'configs'
import { changeEmail } from 'pages/tools/locale'
import {
  SuccessMessage, ViewTitle, Field, SecondaryButton, CodeInput, SubmitError, PrimaryButton,
} from 'pages/components'

export interface ChangeEmailProps {
  locale: typeConfig.Locale;
  success: boolean;
  handleSubmit: (e: Event) => void;
  handleChange: (name: 'email' | 'mfaCode', value: string | string[]) => void;
  values: { email: string; mfaCode: string[] | null };
  errors: { email: string | undefined; mfaCode: string | undefined };
  submitError: string | null;
  redirectUri: string;
  resent: boolean;
  handleResend: () => void;
}

const ChangeEmail = ({
  locale,
  success,
  handleSubmit,
  handleChange,
  values,
  errors,
  submitError,
  redirectUri,
  resent,
  handleResend,
}: ChangeEmailProps) => {
  return (
    <>
      {success && (
        <section className='flex flex-col gap-4'>
          <section className='flex justify-center w-full'>
            <SuccessMessage
              message={changeEmail.success[locale]}
            />
          </section>
          <a
            className='mt-6'
            href={redirectUri}
          >
            {changeEmail.redirect[locale]}
          </a>
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={changeEmail.title[locale]} />
          <form
            autoComplete='on'
            onSubmit={handleSubmit}
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
                onChange={(value) => handleChange(
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
                    onClick={handleResend}
                    disabled={resent}
                  />
                  <CodeInput
                    label={changeEmail.code[locale]}
                    required
                    code={values.mfaCode}
                    setCode={(code) => handleChange(
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
    </>
  )
}

export default ChangeEmail

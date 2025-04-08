import {
  SuccessMessage, Field, PrimaryButton, ViewTitle, SubmitError, SecondaryButton, CodeInput, PasswordField,
} from 'pages/components'
import { View } from 'pages/hooks'
import { resetPassword } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface ResetPasswordProps {
  locale: typeConfig.Locale;
  success: boolean;
  onSubmit: (e: Event) => void;
  submitError: string | null;
  onSwitchView: (view: View) => void;
  values: {
    email: string;
    mfaCode: string[] | null;
    password: string;
    confirmPassword: string;
  };
  errors: {
    email: string | undefined;
    mfaCode: string | undefined;
    password: string | undefined;
    confirmPassword: string | undefined;
  };
  onChange: (name: 'email' | 'mfaCode' | 'password' | 'confirmPassword', value: string | string[]) => void;
  onResend: () => void;
  resent: boolean;
  isSubmitting: boolean;
  isSending: boolean;
}

const ResetPassword = ({
  locale,
  success,
  onSubmit,
  submitError,
  onSwitchView,
  values,
  errors,
  onChange,
  onResend,
  resent,
  isSubmitting,
  isSending,
}: ResetPasswordProps) => {
  return (
    <>
      {success && (
        <section
          class='flex flex-col gap-4 mt-8'
        >
          <SuccessMessage
            message={resetPassword.success[locale]}
          />
          <PrimaryButton
            type='button'
            title={resetPassword.signIn[locale]}
            onClick={() => onSwitchView(View.SignIn)}
          />
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={resetPassword.title[locale]} />
          <p class='mb-4 text-center w-(--text-width)'>
            {resetPassword.desc[locale]}
          </p>
          <form
            autoComplete='on'
            onSubmit={onSubmit}
          >
            <section className='flex flex-col gap-2'>
              <Field
                label={resetPassword.email[locale]}
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
                      ? resetPassword.resent[locale]
                      : resetPassword.resend[locale]
                    }
                    onClick={onResend}
                    disabled={resent}
                    isLoading={isSending}
                  />
                  <CodeInput
                    label={resetPassword.code[locale]}
                    required
                    code={values.mfaCode}
                    setCode={(code) => onChange(
                      'mfaCode',
                      code,
                    )}
                    error={errors.mfaCode}
                  />
                  <PasswordField
                    label={resetPassword.password[locale]}
                    required
                    name='password'
                    value={values.password}
                    error={errors.password}
                    autoComplete='new-password'
                    onChange={(value) => onChange(
                      'password',
                      value,
                    )}
                  />
                  <PasswordField
                    label={resetPassword.confirmPassword[locale]}
                    required
                    name='confirmPassword'
                    value={values.confirmPassword}
                    error={errors.confirmPassword}
                    autoComplete='new-password'
                    onChange={(value) => onChange(
                      'confirmPassword',
                      value,
                    )}
                  />
                </>
              )}
              <SubmitError error={submitError} />
              <PrimaryButton
                className='mt-4'
                type='submit'
                title={
                  values.mfaCode !== null
                    ? resetPassword.reset[locale]
                    : resetPassword.send[locale]
                }
                isLoading={isSubmitting}
              />
            </section>
          </form>
          <SecondaryButton
            title={resetPassword.backSignIn[locale]}
            onClick={() => onSwitchView(View.SignIn)}
          />
        </>
      )}
    </>
  )
}

export default ResetPassword

import { typeConfig } from 'configs'
import {
  CodeInput, Field, PasswordField, PrimaryButton, SecondaryButton, SubmitError, ViewTitle,
} from 'pages/components'
import SuccessMessage from 'pages/components/vanilla/SuccessMessage'
import {
  useResetPasswordForm, useSubmitError,
} from 'pages/hooks'
import { View } from 'pages/hooks/useCurrentView'
import { resetPassword } from 'pages/tools/locale'

export interface ResetPasswordProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ResetPassword = ({
  locale,
  onSwitchView,
}: ResetPasswordProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    handleResend,
    resent,
    success,
  } = useResetPasswordForm({
    locale,
    onSubmitError: handleSubmitError,
  })

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
            onSubmit={handleSubmit}
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
                onChange={(value) => handleChange(
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
                    onClick={handleResend}
                    disabled={resent}
                  />
                  <CodeInput
                    label={resetPassword.code[locale]}
                    required
                    code={values.mfaCode ?? []}
                    setCode={(code) => handleChange(
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
                    onChange={(value) => handleChange(
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
                    onChange={(value) => handleChange(
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

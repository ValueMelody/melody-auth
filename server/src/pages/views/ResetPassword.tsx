import {
  localeConfig, typeConfig,
} from 'configs'
import {
  CodeInput, Field, PasswordField, PrimaryButton, SecondaryButton, SubmitError, ViewTitle,
} from 'pages/components'
import {
  useResetPasswordForm, useSubmitError,
} from 'pages/hooks'
import { View } from 'pages/hooks/useCurrentView'

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
          <p class='text-green text-semibold text-lg'>
            {localeConfig.authorizeReset.success[locale]}
          </p>
          <PrimaryButton
            type='button'
            title={localeConfig.authorizeReset.signIn[locale]}
            onClick={() => onSwitchView(View.SignIn)}
          />
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={localeConfig.authorizeReset.title[locale]} />
          <p class='mb-4 text-center w-(--text-width)'>
            {localeConfig.authorizeReset.desc[locale]}
          </p>
          <form
            autoComplete='on'
            onSubmit={handleSubmit}
          >
            <section className='flex flex-col gap-2'>
              <Field
                label={localeConfig.authorizeReset.email[locale]}
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
                      ? localeConfig.authorizeReset.resent[locale]
                      : localeConfig.authorizeReset.resend[locale]
                    }
                    onClick={handleResend}
                    disabled={resent}
                  />
                  <CodeInput
                    label={localeConfig.authorizeReset.code[locale]}
                    required
                    code={values.mfaCode ?? []}
                    setCode={(code) => handleChange(
                      'mfaCode',
                      code,
                    )}
                    error={errors.mfaCode}
                  />
                  <PasswordField
                    label={localeConfig.authorizeReset.password[locale]}
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
                    label={localeConfig.authorizeReset.confirmPassword[locale]}
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
                    ? localeConfig.authorizeReset.reset[locale]
                    : localeConfig.authorizeReset.send[locale]
                }
              />
            </section>
          </form>
          <SecondaryButton
            title={localeConfig.authorizeReset.backSignIn[locale]}
            onClick={() => onSwitchView(View.SignIn)}
          />
        </>
      )}
    </>
  )
}

export default ResetPassword

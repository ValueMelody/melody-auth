import {
  localeConfig, typeConfig,
} from 'configs'
import {
  Field, PrimaryButton, SecondaryButton, ViewTitle, PasswordField, GoogleSignIn, SubmitError, FacebookSignIn,
} from 'pages/components'
import GithubSignIn from 'pages/components/vanilla/GithubSignIn'
import {
  InitialProps, View, useSubmitError, usePasswordViewForm,
} from 'pages/hooks'

export interface PasswordViewProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
  enableSignUp: boolean;
  enablePasswordSignIn: boolean;
  enablePasswordReset: boolean;
  initialProps: InitialProps;
  googleClientId: string;
  facebookClientId: string;
  githubClientId: string;
}

const PasswordView = ({
  locale,
  onSwitchView,
  enableSignUp,
  enablePasswordSignIn,
  enablePasswordReset,
  initialProps,
  googleClientId,
  facebookClientId,
  githubClientId,
}: PasswordViewProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    onSwitchView,
    locale,
  })
  const {
    values, errors, handleChange, handleSubmit,
  } = usePasswordViewForm({
    locale, initialProps, handleSubmitError,
  })

  return (
    <>
      <ViewTitle title={localeConfig.authorizePassword.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-2'>
          {enablePasswordSignIn && (
            <>
              <Field
                label={localeConfig.authorizePassword.email[locale]}
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
              <PasswordField
                label={localeConfig.authorizePassword.password[locale]}
                required
                name='password'
                value={values.password}
                error={errors.password}
                autoComplete='current-password'
                onChange={(value) => handleChange(
                  'password',
                  value,
                )}
              />
            </>
          )}
          <SubmitError error={submitError} />
          {enablePasswordSignIn && (
            <PrimaryButton
              className='mt-4'
              title={localeConfig.authorizePassword.submit[locale]}
              type='submit'
            />
          )}
        </section>
        {(googleClientId || facebookClientId || githubClientId) && (
          <section className='flex flex-col gap-4 mt-4'>
            <GoogleSignIn
              googleClientId={googleClientId}
              locale={locale}
              initialProps={initialProps}
              handleSubmitError={handleSubmitError}
            />
            <FacebookSignIn
              facebookClientId={facebookClientId}
              locale={locale}
              initialProps={initialProps}
              handleSubmitError={handleSubmitError}
            />
            <GithubSignIn
              githubClientId={githubClientId}
              locale={locale}
              initialProps={initialProps}
            />
          </section>
        )}
      </form>
      {(enableSignUp || enablePasswordReset) && (
        <section className='flex flex-col gap-2'>
          {enableSignUp && (
            <SecondaryButton
              title={localeConfig.authorizePassword.signUp[locale]}
              onClick={() => onSwitchView(View.Account)}
            />
          )}
          {enablePasswordReset && (
            <SecondaryButton
              title={localeConfig.authorizePassword.passwordReset[locale]}
              onClick={() => onSwitchView(View.ResetPassword)}
            />
          )}
        </section>
      )}
    </>
  )
}

export default PasswordView

import {
  ViewTitle, Field, PasswordField, PrimaryButton, SubmitError, SecondaryButton,
  GoogleSignIn, FacebookSignIn, GithubSignIn, DiscordSignIn, OidcSignIn,
} from 'pages/components'
import { typeConfig } from 'configs'
import {
  InitialProps, View,
} from 'pages/hooks'
import { signIn } from 'pages/tools/locale'
import { AuthorizeParams } from 'pages/tools/param'

export interface SignInProps {
  locale: typeConfig.Locale;
  handleSubmit: (e: Event) => void;
  handleChange: (name: 'email' | 'password', value: string) => void;
  values: {
    email: string;
    password: string;
  };
  errors: {
    email: string | undefined;
    password: string | undefined;
  };
  submitError: string | null;
  onSwitchView: (view: View) => void;
  initialProps: InitialProps;
  handleVerifyPasskey: () => void;
  handlePasswordlessSignIn: (e: Event) => void;
  getPasskeyOption: () => void;
  shouldLoadPasskeyInfo: boolean;
  passkeyOption: false | null | PublicKeyCredentialRequestOptionsJSON;
  handleSubmitError: (error: string) => void;
  params: AuthorizeParams;
}

const SignIn = ({
  locale,
  handleSubmit,
  handleChange,
  values,
  errors,
  submitError,
  onSwitchView,
  initialProps,
  handleVerifyPasskey,
  handlePasswordlessSignIn,
  getPasskeyOption,
  shouldLoadPasskeyInfo,
  passkeyOption,
  handleSubmitError,
  params,
}: SignInProps) => {
  return (
    <>
      <ViewTitle title={signIn.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-2'>
          {(initialProps.enablePasswordSignIn || initialProps.enablePasswordlessSignIn) && (
            <>
              <Field
                label={signIn.email[locale]}
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

              {!!passkeyOption && (
                <PrimaryButton
                  type='button'
                  className='mt-2 mb-4'
                  title={signIn.withPasskey[locale]}
                  onClick={handleVerifyPasskey}
                />
              )}
            </>
          )}
          {initialProps.enablePasswordSignIn && !shouldLoadPasskeyInfo && (
            <PasswordField
              label={signIn.password[locale]}
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
          )}
          <SubmitError error={submitError} />
          {shouldLoadPasskeyInfo && (
            <PrimaryButton
              type='button'
              className='mt-4'
              title={signIn.continue[locale]}
              onClick={getPasskeyOption}
            />
          )}
          {initialProps.enablePasswordSignIn && !shouldLoadPasskeyInfo && (
            <PrimaryButton
              className='mt-4'
              title={signIn.submit[locale]}
              type='submit'
            />
          )}
          {initialProps.enablePasswordlessSignIn && !shouldLoadPasskeyInfo && (
            <PrimaryButton
              type='button'
              className='mt-4'
              title={signIn.continue[locale]}
              onClick={handlePasswordlessSignIn}
            />
          )}
        </section>
        {(
          initialProps.googleClientId ||
          initialProps.facebookClientId ||
          initialProps.githubClientId ||
          initialProps.discordClientId ||
          initialProps.oidcProviders?.length > 0
        ) && (
          <section className='flex flex-col gap-4 mt-4'>
            <GoogleSignIn
              googleClientId={initialProps.googleClientId}
              locale={locale}
              params={params}
              handleSubmitError={handleSubmitError}
              onSwitchView={onSwitchView}
            />
            <FacebookSignIn
              facebookClientId={initialProps.facebookClientId}
              locale={locale}
              params={params}
              handleSubmitError={handleSubmitError}
              onSwitchView={onSwitchView}
            />
            <GithubSignIn
              githubClientId={initialProps.githubClientId}
              locale={locale}
              params={params}
              handleSubmitError={handleSubmitError}
              onSwitchView={onSwitchView}
            />
            <DiscordSignIn
              discordClientId={initialProps.discordClientId}
              locale={locale}
              params={params}
              handleSubmitError={handleSubmitError}
              onSwitchView={onSwitchView}
            />
            <OidcSignIn
              oidcProviders={initialProps.oidcProviders}
              locale={locale}
              params={params}
              handleSubmitError={handleSubmitError}
              onSwitchView={onSwitchView}
            />
          </section>
        )}
      </form>
      {(initialProps.enableSignUp || initialProps.enablePasswordReset) && (
        <section className='flex flex-col gap-2'>
          {initialProps.enableSignUp && (
            <SecondaryButton
              title={signIn.signUp[locale]}
              onClick={() => onSwitchView(View.SignUp)}
            />
          )}
          {initialProps.enablePasswordReset && (
            <SecondaryButton
              title={signIn.passwordReset[locale]}
              onClick={() => onSwitchView(View.ResetPassword)}
            />
          )}
        </section>
      )}
    </>
  )
}

export default SignIn

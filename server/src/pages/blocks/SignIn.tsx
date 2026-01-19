import {
  ViewTitle, PasswordField, PrimaryButton, SubmitError, SecondaryButton,
  GoogleSignIn, FacebookSignIn, GithubSignIn, DiscordSignIn, OidcSignIn, AppleSignIn,
  Banner,
} from 'pages/components'
import { typeConfig } from 'configs'
import {
  InitialProps, View,
} from 'pages/hooks'
import { signIn } from 'pages/tools/locale'
import { AuthorizeParams } from 'pages/tools/param'
import EmailField from 'pages/components/vanilla/EmailField'
import { bannerModel } from 'models'

export interface SignInProps {
  locale: typeConfig.Locale;
  onSubmit: (e: Event) => void;
  onChange: (name: 'email' | 'password', value: string) => void;
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
  onVerifyPasskey: () => void;
  onPasswordlessSignIn: (e: Event) => void;
  onSubmitError: (error: string) => void;
  params: AuthorizeParams;
  isSubmitting: boolean;
  isVerifyingPasskey: boolean;
  isPasswordlessSigningIn: boolean;
  appBanners: bannerModel.Record[];
}

const SignIn = ({
  locale,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  onSwitchView,
  initialProps,
  onVerifyPasskey,
  onPasswordlessSignIn,
  onSubmitError,
  params,
  isSubmitting,
  isVerifyingPasskey,
  isPasswordlessSigningIn,
  appBanners,
}: SignInProps) => {
  return (
    <>
      <ViewTitle title={signIn.title[locale]} />
      {appBanners.map((banner) => (
        <Banner
          key={banner.id}
          type={banner.type}
          text={banner.locales.find((bannerLocale) => bannerLocale.locale === locale)?.value || banner.text}
        />
      ))}
      <form
        autoComplete='on'
        onSubmit={onSubmit}
      >
        <section className='flex flex-col gap-2'>
          {(initialProps.enablePasswordSignIn || initialProps.enablePasswordlessSignIn) && (
            <>
              <EmailField
                label={signIn.email[locale]}
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
            </>
          )}
          {initialProps.enablePasswordSignIn && (
            <PasswordField
              label={signIn.password[locale]}
              required
              name='password'
              value={values.password}
              error={errors.password}
              autoComplete='current-password'
              onChange={(value) => onChange(
                'password',
                value,
              )}
            />
          )}
          <SubmitError error={submitError} />
          {initialProps.enablePasswordSignIn && (
            <PrimaryButton
              className='mt-4'
              title={signIn.submit[locale]}
              type='submit'
              isLoading={isSubmitting}
            />
          )}
          {initialProps.enablePasswordlessSignIn && !initialProps.allowPasskey && (
            <PrimaryButton
              type='button'
              className='mt-4'
              title={signIn.continue[locale]}
              onClick={onPasswordlessSignIn}
              isLoading={isPasswordlessSigningIn}
            />
          )}
        </section>
        {(
          initialProps.googleClientId ||
          initialProps.facebookClientId ||
          initialProps.githubClientId ||
          initialProps.discordClientId ||
          initialProps.appleClientId ||
          initialProps.oidcProviders?.length > 0
        ) && (
          <section className='flex flex-col gap-4 mt-4 items-center'>
            <GoogleSignIn
              googleClientId={initialProps.googleClientId}
              locale={locale}
              params={params}
              onSubmitError={onSubmitError}
              onSwitchView={onSwitchView}
            />
            <FacebookSignIn
              facebookClientId={initialProps.facebookClientId}
              locale={locale}
              params={params}
              onSubmitError={onSubmitError}
              onSwitchView={onSwitchView}
            />
            <GithubSignIn
              githubClientId={initialProps.githubClientId}
              locale={locale}
              params={params}
              onSubmitError={onSubmitError}
              onSwitchView={onSwitchView}
            />
            <DiscordSignIn
              discordClientId={initialProps.discordClientId}
              locale={locale}
              params={params}
              onSubmitError={onSubmitError}
              onSwitchView={onSwitchView}
            />
            <AppleSignIn
              appleClientId={initialProps.appleClientId}
              locale={locale}
              params={params}
              onSubmitError={onSubmitError}
              onSwitchView={onSwitchView}
            />
            <OidcSignIn
              oidcProviders={initialProps.oidcProviders}
              locale={locale}
              params={params}
              onSubmitError={onSubmitError}
              onSwitchView={onSwitchView}
            />
          </section>
        )}
      </form>
      {(
        initialProps.enableSignUp ||
        initialProps.allowRecoveryCode ||
        initialProps.enablePasswordReset ||
        initialProps.allowPasskey
      ) && (
        <section className='flex flex-col gap-2'>
          {initialProps.allowPasskey && (
            <SecondaryButton
              title={signIn.withPasskey[locale]}
              onClick={onVerifyPasskey}
              isLoading={isVerifyingPasskey}
            />
          )}
          {initialProps.allowRecoveryCode && (
            <SecondaryButton
              title={signIn.recoveryCode[locale]}
              onClick={() => onSwitchView(View.RecoveryCodeSignIn)}
            />
          )}
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

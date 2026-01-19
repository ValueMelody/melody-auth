import { typeConfig } from 'configs'
import {
  View, useSubmitError, useSignInForm,
  useInitialProps, usePasskeyVerifyForm,
  useAppBanners,
} from 'pages/hooks'
import { getAuthorizeParams } from 'pages/tools/param'
import { SignIn as SignInBlock } from 'pages/blocks'

export interface PasswordViewProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View, response?: any) => void;
}

const SignIn = ({
  locale,
  onSwitchView,
}: PasswordViewProps) => {
  const { initialProps } = useInitialProps()
  const params = getAuthorizeParams()

  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    onSwitchView,
    locale,
  })

  const {
    values, errors, handleChange, handleSubmit, handlePasswordlessSignIn,
    isSubmitting, isPasswordlessSigningIn,
  } = useSignInForm({
    locale,
    params,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  const {
    handleVerifyPasskey,
    isVerifyingPasskey,
  } = usePasskeyVerifyForm({
    params,
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
    initialProps,
  })

  const { appBanners } = useAppBanners({
    initialProps,
    params,
  })

  return (
    <SignInBlock
      onSubmitError={handleSubmitError}
      params={params}
      locale={locale}
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      onSwitchView={onSwitchView}
      initialProps={initialProps}
      onVerifyPasskey={handleVerifyPasskey}
      onPasswordlessSignIn={handlePasswordlessSignIn}
      isSubmitting={isSubmitting}
      isVerifyingPasskey={isVerifyingPasskey}
      isPasswordlessSigningIn={isPasswordlessSigningIn}
      appBanners={appBanners}
    />
  )
}

export default SignIn

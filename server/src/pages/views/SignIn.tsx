import { typeConfig } from 'configs'
import {
  View, useSubmitError, useSignInForm,
  useInitialProps, usePasskeyVerifyForm,
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
    values, errors, handleChange, handleSubmit, handlePasswordlessSignIn, isSubmitting, isPasswordlessSigningIn,
  } = useSignInForm({
    locale,
    params,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  const {
    passkeyOption,
    handleResetPasskeyInfo,
    getPasskeyOption,
    handleVerifyPasskey,
    isVerifyingPasskey,
  } = usePasskeyVerifyForm({
    params,
    email: values.email,
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  const shouldLoadPasskeyInfo = initialProps.allowPasskey && passkeyOption === null

  return (
    <SignInBlock
      passkeyOption={passkeyOption}
      onResetPasskeyInfo={handleResetPasskeyInfo}
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
      getPasskeyOption={getPasskeyOption}
      shouldLoadPasskeyInfo={shouldLoadPasskeyInfo}
      isSubmitting={isSubmitting}
      isVerifyingPasskey={isVerifyingPasskey}
      isPasswordlessSigningIn={isPasswordlessSigningIn}
    />
  )
}

export default SignIn

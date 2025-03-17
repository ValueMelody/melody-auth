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
    values, errors, handleChange, handleSubmit, handlePasswordlessSignIn,
  } = useSignInForm({
    locale,
    params,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  const {
    passkeyOption, getPasskeyOption,
    handleVerifyPasskey,
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
      handleSubmitError={handleSubmitError}
      params={params}
      locale={locale}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      onSwitchView={onSwitchView}
      initialProps={initialProps}
      handleVerifyPasskey={handleVerifyPasskey}
      handlePasswordlessSignIn={handlePasswordlessSignIn}
      getPasskeyOption={getPasskeyOption}
      shouldLoadPasskeyInfo={shouldLoadPasskeyInfo}
    />
  )
}

export default SignIn

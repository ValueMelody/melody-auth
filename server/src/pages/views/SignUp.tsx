import { typeConfig } from 'configs'
import {
  useSubmitError, View, useSignUpForm,
  useInitialProps,
} from 'pages/hooks'
import { getAuthorizeParams } from 'pages/tools/param'
import { SignUp as SignUpBlock } from 'pages/blocks'

export interface SignUpProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View, response?: any) => void;
}

const SignUp = ({
  locale,
  onSwitchView,
}: SignUpProps) => {
  const { initialProps } = useInitialProps()
  const params = getAuthorizeParams()

  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    onSwitchView,
    locale,
  })
  const {
    values, errors, handleChange, handleSubmit,
  } = useSignUpForm({
    locale,
    initialProps,
    params,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  return (
    <SignUpBlock
      locale={locale}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      onSwitchView={onSwitchView}
      initialProps={initialProps}
    />
  )
}

export default SignUp

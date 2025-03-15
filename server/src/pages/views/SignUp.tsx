import { typeConfig } from 'configs'
import {
  PrimaryButton, SubmitError, PasswordField, Field, SecondaryButton,
} from 'pages/components'
import ViewTitle from 'pages/components/vanilla/ViewTitle'
import {
  useSubmitError, View, useSignUpForm,
  useInitialProps,
} from 'pages/hooks'
import { signUp } from 'pages/tools/locale'
import { getAuthorizeParams } from 'pages/tools/param'

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
    <>
      <ViewTitle title={signUp.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-2'>
          <Field
            label={signUp.email[locale]}
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
            label={signUp.password[locale]}
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
            label={signUp.confirmPassword[locale]}
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
          {initialProps.enableNames && (
            <>
              <Field
                label={signUp.firstName[locale]}
                type='text'
                required={initialProps.namesIsRequired}
                value={values.firstName}
                name='firstName'
                error={errors.firstName}
                onChange={(value) => handleChange(
                  'firstName',
                  value,
                )}
              />
              <Field
                label={signUp.lastName[locale]}
                type='text'
                required={initialProps.namesIsRequired}
                value={values.lastName}
                name='lastName'
                error={errors.lastName}
                onChange={(value) => handleChange(
                  'lastName',
                  value,
                )}
              />
            </>
          )}
          <SubmitError error={submitError} />
          <PrimaryButton
            className='mt-4'
            title={signUp.signUp[locale]}
            type='submit'
          />
          {(initialProps.termsLink || initialProps.privacyPolicyLink) && (
            <div class='text-center text-gray'>
              <p class='flex flex-row items-center justify-start flex-wrap w-(--text-width)'>
                {signUp.bySignUp[locale]}&nbsp;
                {initialProps.termsLink && (
                  <a
                    target='_blank'
                    href={initialProps.termsLink}
                    rel='noreferrer'
                    className='text-blue-500'
                  >
                    {signUp.terms[locale]}
                  </a>
                )}
                {initialProps.termsLink && initialProps.privacyPolicyLink && (
                  <>
                    &nbsp;{signUp.linkConnect[locale]}&nbsp;
                  </>
                )}
                {initialProps.privacyPolicyLink && (
                  <a
                    target='_blank'
                    href={initialProps.privacyPolicyLink}
                    rel='noreferrer'
                    className='text-blue-500'
                  >
                    {signUp.privacyPolicy[locale]}
                  </a>
                )}
              </p>
            </div>
          )}
        </section>
      </form>
      <SecondaryButton
        title={signUp.signIn[locale]}
        onClick={() => onSwitchView(View.SignIn)}
      />
    </>
  )
}

export default SignUp

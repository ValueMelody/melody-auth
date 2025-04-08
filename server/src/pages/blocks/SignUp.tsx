import {
  Field, SecondaryButton, PasswordField, PrimaryButton, SubmitError, ViewTitle,
} from 'pages/components'

import {
  InitialProps, View,
} from 'pages/hooks'
import { signUp } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface SignUpProps {
  locale: typeConfig.Locale;
  onSubmit: (e: Event) => void;
  onChange: (name: 'email' | 'password' | 'confirmPassword' | 'firstName' | 'lastName', value: string) => void;
  values: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  };
  errors: {
    email: string | undefined;
    password: string | undefined;
    confirmPassword: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
  };
  submitError: string | null;
  onSwitchView: (view: View) => void;
  initialProps: InitialProps;
  isSubmitting: boolean;
}

const SignUp = ({
  locale,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  onSwitchView,
  initialProps,
  isSubmitting,
}: SignUpProps) => {
  return (
    <>
      <ViewTitle title={signUp.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={onSubmit}
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
            onChange={(value) => onChange(
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
            onChange={(value) => onChange(
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
            onChange={(value) => onChange(
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
                onChange={(value) => onChange(
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
                onChange={(value) => onChange(
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
            isLoading={isSubmitting}
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

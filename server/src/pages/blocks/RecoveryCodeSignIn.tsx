import {
  Field, SecondaryButton, PrimaryButton, SubmitError, ViewTitle,
} from 'pages/components'

import { View } from 'pages/hooks'
import { recoveryCodeSignIn } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface RecoveryCodeSignInProps {
  locale: typeConfig.Locale;
  onSubmit: (e: Event) => void;
  onChange: (name: 'email' | 'recoveryCode', value: string) => void;
  values: {
    email: string;
    recoveryCode: string;
  };
  errors: {
    email: string | undefined;
    recoveryCode: string | undefined;
  };
  submitError: string | null;
  onSwitchView: (view: View) => void;
  isSubmitting: boolean;
}

const RecoveryCodeSignIn = ({
  locale,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  onSwitchView,
  isSubmitting,
}: RecoveryCodeSignInProps) => {
  return (
    <>
      <ViewTitle title={recoveryCodeSignIn.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={onSubmit}
      >
        <section className='flex flex-col gap-2'>
          <Field
            label={recoveryCodeSignIn.email[locale]}
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
          <Field
            label={recoveryCodeSignIn.recoveryCode[locale]}
            type='text'
            required
            value={values.recoveryCode}
            name='recoveryCode'
            autoComplete='recoveryCode'
            error={errors.recoveryCode}
            onChange={(value) => onChange(
              'recoveryCode',
              value,
            )}
          />
          <SubmitError error={submitError} />
          <PrimaryButton
            className='mt-4'
            title={recoveryCodeSignIn.confirm[locale]}
            type='submit'
            isLoading={isSubmitting}
          />
        </section>
      </form>
      <SecondaryButton
        title={recoveryCodeSignIn.signIn[locale]}
        onClick={() => onSwitchView(View.SignIn)}
      />
    </>
  )
}

export default RecoveryCodeSignIn

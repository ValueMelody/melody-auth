import {
  PasswordField, PrimaryButton, SubmitError, SuccessMessage, ViewTitle,
} from 'pages/components'
import { changePassword } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface ChangePasswordProps {
  locale: typeConfig.Locale;
  success: boolean;
  onSubmit: (e: Event) => void;
  onChange: (name: 'password' | 'confirmPassword', value: string) => void;
  values: { password: string; confirmPassword: string };
  errors: { password: string | undefined; confirmPassword: string | undefined };
  submitError: string | null;
  redirectUri: string;
  isSubmitting: boolean;
}

const ChangePassword = ({
  locale,
  success,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  redirectUri,
  isSubmitting,
}: ChangePasswordProps) => {
  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={changePassword.success[locale]}
          />
        </section>
      )}
      <ViewTitle title={changePassword.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={onSubmit}
      >
        <section className='flex flex-col gap-2'>
          <PasswordField
            label={changePassword.newPassword[locale]}
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
            label={changePassword.confirmNewPassword[locale]}
            required
            name='confirmPassword'
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={(value) => onChange(
              'confirmPassword',
              value,
            )}
          />
          <SubmitError error={submitError} />
          <PrimaryButton
            className='mt-4'
            isLoading={isSubmitting}
            type='submit'
            title={changePassword.confirm[locale]}
          />
        </section>
      </form>
      <a
        className='mt-6'
        href={redirectUri}
      >
        {changePassword.redirect[locale]}
      </a>
    </>
  )
}

export default ChangePassword

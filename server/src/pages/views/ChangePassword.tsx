import {
  localeConfig, typeConfig,
} from 'configs'
import {
  PasswordField,
  PrimaryButton,
  SubmitError,
  SuccessMessage,
  ViewTitle,
} from 'pages/components'
import {
  useChangePasswordForm, View,
  useSubmitError,
} from 'pages/hooks'

export interface ChangePasswordProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ChangePassword = ({
  locale,
  onSwitchView,
}: ChangePasswordProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    success,
    redirectUri,
  } = useChangePasswordForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={localeConfig.changePassword.success[locale]}
          />
        </section>
      )}
      <ViewTitle title={localeConfig.changePassword.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-2'>
          <PasswordField
            label={localeConfig.changePassword.newPassword[locale]}
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
            label={localeConfig.changePassword.confirmNewPassword[locale]}
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
          <SubmitError error={submitError} />
          <PrimaryButton
            className='mt-4'
            type='submit'
            title={localeConfig.changePassword.confirm[locale]}
          />
        </section>
      </form>
      <a
        className='mt-6'
        href={redirectUri}
      >
        {localeConfig.changePassword.redirect[locale]}
      </a>
    </>
  )
}

export default ChangePassword

import {
  PrimaryButton, SubmitError, SuccessMessage, ViewTitle, PasswordField,
} from 'pages/components'
import { acceptInvitation } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface AcceptInvitationProps {
  success: boolean;
  locale: typeConfig.Locale;
  onSubmit: (e: Event) => void;
  onChange: (name: 'password' | 'confirmPassword', value: string) => void;
  values: { password: string; confirmPassword: string };
  errors: { password: string | undefined; confirmPassword: string | undefined };
  submitError: string | null;
  isSubmitting: boolean;
  isTokenValid: boolean | null;
  signinUrl?: string | null;
}

const AcceptInvitation = ({
  success,
  locale,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  isSubmitting,
  isTokenValid,
  signinUrl,
}: AcceptInvitationProps) => {
  return (
    <>
      {isTokenValid === false && (
        <p class='text-center w-(--text-width)'>
          {acceptInvitation.expired[locale]}
        </p>
      )}
      {isTokenValid === null && null}
      {isTokenValid === true && success && (
        <section className='flex flex-col items-center gap-4 w-full'>
          <SuccessMessage
            message={acceptInvitation.success[locale]}
          />
          {signinUrl && (
            <a href={signinUrl}>
              <PrimaryButton
                type='button'
                title={acceptInvitation.signIn[locale]}
              />
            </a>
          )}
        </section>
      )}
      {isTokenValid === true && !success && (
        <>
          <ViewTitle title={acceptInvitation.title[locale]} />
          <p class='mb-4 text-center w-(--text-width)'>
            {acceptInvitation.desc[locale]}
          </p>
          <form
            autoComplete='on'
            onSubmit={onSubmit}
          >
            <section className='flex flex-col gap-2'>
              <PasswordField
                label={acceptInvitation.password[locale]}
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
                label={acceptInvitation.confirmPassword[locale]}
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
              <SubmitError error={submitError} />
              <PrimaryButton
                className='mt-4'
                type='submit'
                title={acceptInvitation.confirm[locale]}
                isLoading={isSubmitting}
              />
            </section>
          </form>
        </>
      )}
    </>
  )
}

export default AcceptInvitation

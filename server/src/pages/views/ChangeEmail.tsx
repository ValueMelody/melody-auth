import {
  localeConfig, typeConfig,
} from 'configs'
import {
  CodeInput, Field, PrimaryButton, SecondaryButton, SubmitError, SuccessMessage, ViewTitle,
} from 'pages/components'
import {
  useChangeEmailForm, useSubmitError,
} from 'pages/hooks'
import { View } from 'pages/hooks/useCurrentView'

interface ChangeEmailProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ChangeEmail = ({
  locale,
  onSwitchView,
}: ChangeEmailProps) => {
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
    resent,
    handleResend,
  } = useChangeEmailForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <>
      {success && (
        <section className='flex flex-col gap-4'>
          <section className='flex justify-center w-full'>
            <SuccessMessage
              message={localeConfig.changeEmail.success[locale]}
            />
          </section>
          <a
            className='mt-6'
            href={redirectUri}
          >
            {localeConfig.changePassword.redirect[locale]}
          </a>
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={localeConfig.changeEmail.title[locale]} />
          <form
            autoComplete='on'
            onSubmit={handleSubmit}
          >
            <section className='flex flex-col gap-2'>
              <Field
                label={localeConfig.changeEmail.email[locale]}
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
              {values.mfaCode !== null && (
                <>
                  <SecondaryButton
                    title={resent
                      ? localeConfig.changeEmail.resent[locale]
                      : localeConfig.changeEmail.resend[locale]
                    }
                    onClick={handleResend}
                    disabled={resent}
                  />
                  <CodeInput
                    label={localeConfig.changeEmail.code[locale]}
                    required
                    code={values.mfaCode ?? []}
                    setCode={(code) => handleChange(
                      'mfaCode',
                      code,
                    )}
                    error={errors.mfaCode}
                  />
                </>
              )}
              <SubmitError error={submitError} />
              <PrimaryButton
                className='mt-4'
                type='submit'
                title={
                  values.mfaCode !== null
                    ? localeConfig.changeEmail.confirm[locale]
                    : localeConfig.changeEmail.sendCode[locale]
                }
              />
            </section>
          </form>
        </>
      )}
    </>
  )
}

export default ChangeEmail

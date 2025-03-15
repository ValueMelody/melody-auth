import { typeConfig } from 'configs'
import {
  CodeInput, PrimaryButton, SubmitError, SuccessMessage, ViewTitle,
} from 'pages/components'
import {
  useSubmitError, useVerifyEmailForm, View,
} from 'pages/hooks'
import { verifyEmail } from 'pages/tools/locale'

export interface VerifyEmailProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const VerifyEmail = ({
  locale,
  onSwitchView,
}: VerifyEmailProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    success,
    handleSubmit,
    handleChange,
    values,
    errors,
  } = useVerifyEmailForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={verifyEmail.success[locale]}
          />
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={verifyEmail.title[locale]} />
          <p class='mb-2 w-(--text-width) text-center'>
            {verifyEmail.desc[locale]}
          </p>
          <form
            onSubmit={handleSubmit}
          >
            <section className='flex flex-col gap-2'>
              <CodeInput
                required
                code={values.mfaCode}
                setCode={(code) => handleChange(
                  'mfaCode',
                  code,
                )}
                error={errors.mfaCode}
              />
              <SubmitError
                error={submitError}
              />
              <PrimaryButton
                className='mt-4'
                type='submit'
                title={verifyEmail.verify[locale]}
              />
            </section>
          </form>
        </>
      )}
    </>
  )
}

export default VerifyEmail

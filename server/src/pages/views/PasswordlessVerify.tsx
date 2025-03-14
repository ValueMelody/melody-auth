import { useEffect } from 'hono/jsx'
import {
  localeConfig, typeConfig,
} from 'configs'
import {
  SecondaryButton, CodeInput, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'
import {
  usePasswordlessVerifyForm, useSubmitError, View,
} from 'pages/hooks'

export interface PasswordlessVerifyProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const PasswordlessVerify = ({
  locale,
  onSwitchView,
}: PasswordlessVerifyProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    resent, values, errors, handleChange, sendPasswordlessCode, handleSubmit,
  } = usePasswordlessVerifyForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      sendPasswordlessCode()
    },
    [sendPasswordlessCode],
  )

  return (
    <>
      <ViewTitle
        title={localeConfig.authorizePasswordlessCode.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <SecondaryButton
            title={resent
              ? localeConfig.authorizePasswordlessCode.resent[locale]
              : localeConfig.authorizePasswordlessCode.resend[locale]
            }
            disabled={resent}
            onClick={() => sendPasswordlessCode(true)}
          />
          <CodeInput
            label={localeConfig.authorizePasswordlessCode.code[locale]}
            required
            code={values.mfaCode ?? []}
            error={errors.mfaCode}
            setCode={(value) => handleChange(
              'mfaCode',
              value,
            )}
          />
          <SubmitError error={submitError} />
          <PrimaryButton
            title={localeConfig.authorizePasswordlessCode.verify[locale]}
            type='submit'
          />
        </section>
      </form>
    </>
  )
}

export default PasswordlessVerify

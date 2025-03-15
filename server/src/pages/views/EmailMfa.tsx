import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  SecondaryButton, CodeInput, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'
import {
  useEmailMfaForm, useSubmitError, View,
} from 'pages/hooks'
import { emailMfa } from 'pages/tools/locale'

export interface EmailMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const EmailMfa = ({
  locale,
  onSwitchView,
}: EmailMfaProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    resent, values, errors, handleChange, sendEmailMfa, handleSubmit,
  } = useEmailMfaForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      sendEmailMfa()
    },
    [sendEmailMfa],
  )

  return (
    <>
      <ViewTitle
        title={emailMfa.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <SecondaryButton
            title={resent
              ? emailMfa.resent[locale]
              : emailMfa.resend[locale]
            }
            disabled={resent}
            onClick={() => sendEmailMfa(true)}
          />
          <CodeInput
            label={emailMfa.code[locale]}
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
            title={emailMfa.verify[locale]}
            type='submit'
          />
        </section>
      </form>
    </>
  )
}

export default EmailMfa

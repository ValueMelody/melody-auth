import { useEffect } from 'hono/jsx'
import {
  localeConfig, typeConfig,
} from 'configs'
import {
  SecondaryButton, CodeInput, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'
import {
  useEmailMfaForm, useSubmitError, View,
} from 'pages/hooks'

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
        title={localeConfig.authorizeEmailMfa.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <SecondaryButton
            title={resent
              ? localeConfig.authorizeEmailMfa.resent[locale]
              : localeConfig.authorizeEmailMfa.resend[locale]
            }
            disabled={resent}
            onClick={() => sendEmailMfa(true)}
          />
          <CodeInput
            label={localeConfig.authorizeEmailMfa.code[locale]}
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
            title={localeConfig.authorizeEmailMfa.verify[locale]}
            type='submit'
          />
        </section>
      </form>
    </>
  )
}

export default EmailMfa

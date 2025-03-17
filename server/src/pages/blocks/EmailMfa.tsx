import {
  CodeInput, SecondaryButton, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'
import { emailMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface EmailMfaProps {
  locale: typeConfig.Locale;
  handleSubmit: (e: Event) => void;
  handleChange: (name: 'mfaCode', value: string[]) => void;
  values: { mfaCode: string[] | null };
  errors: { mfaCode: string | undefined };
  submitError: string | null;
  resent: boolean;
  sendEmailMfa: (send: boolean) => void;
}

const EmailMfa = ({
  locale,
  handleSubmit,
  handleChange,
  values,
  errors,
  submitError,
  resent,
  sendEmailMfa,
}: EmailMfaProps) => {
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

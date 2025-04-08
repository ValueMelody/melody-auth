import {
  CodeInput, SecondaryButton, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'
import { emailMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface EmailMfaProps {
  locale: typeConfig.Locale;
  onSubmit: (e: Event) => void;
  onChange: (name: 'mfaCode', value: string[]) => void;
  values: { mfaCode: string[] | null };
  errors: { mfaCode: string | undefined };
  submitError: string | null;
  resent: boolean;
  sendEmailMfa: (send: boolean) => void;
  isSubmitting: boolean;
  isSending: boolean;
}

const EmailMfa = ({
  locale,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  resent,
  sendEmailMfa,
  isSubmitting,
  isSending,
}: EmailMfaProps) => {
  return (
    <>
      <ViewTitle
        title={emailMfa.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={onSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <SecondaryButton
            title={resent
              ? emailMfa.resent[locale]
              : emailMfa.resend[locale]
            }
            disabled={resent}
            isLoading={isSending}
            onClick={() => sendEmailMfa(true)}
          />
          <CodeInput
            label={emailMfa.code[locale]}
            required
            code={values.mfaCode ?? []}
            error={errors.mfaCode}
            setCode={(value) => onChange(
              'mfaCode',
              value,
            )}
          />
          <SubmitError error={submitError} />
          <PrimaryButton
            title={emailMfa.verify[locale]}
            type='submit'
            isLoading={isSubmitting}
          />
        </section>
      </form>
    </>
  )
}

export default EmailMfa

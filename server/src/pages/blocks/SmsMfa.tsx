import { typeConfig } from 'configs'
import {
  ViewTitle, PhoneField, SecondaryButton, CodeInput, SubmitError, PrimaryButton,
} from 'pages/components'
import { View } from 'pages/hooks'
import { smsMfa } from 'pages/tools/locale'

export interface SmsMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
  handleSubmit: (e: Event) => void;
  handleChange: (name: 'phoneNumber' | 'mfaCode', value: string | string[]) => void;
  values: { phoneNumber: string; mfaCode: string[] | null };
  errors: { phoneNumber: string | undefined; mfaCode: string | undefined };
  submitError: string | null;
  currentNumber: string | null;
  countryCode: string;
  allowFallbackToEmailMfa: boolean;
  resent: boolean;
  handleResend: () => void;
}

const SmsMfa = ({
  locale,
  onSwitchView,
  handleSubmit,
  handleChange,
  values,
  errors,
  submitError,
  currentNumber,
  countryCode,
  allowFallbackToEmailMfa,
  resent,
  handleResend,
}: SmsMfaProps) => {
  return (
    <>
      <ViewTitle
        title={smsMfa.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <PhoneField
            countryCode={countryCode}
            label={smsMfa.phoneNumber[locale]}
            required={!currentNumber}
            name='phoneNumber'
            value={currentNumber ?? values.phoneNumber}
            disabled={!!currentNumber}
            onChange={(value) => handleChange(
              'phoneNumber',
              value,
            )}
            error={errors.phoneNumber}
          />
          {values.mfaCode && (
            <>
              <SecondaryButton
                title={resent
                  ? smsMfa.resent[locale]
                  : smsMfa.resend[locale]
                }
                onClick={handleResend}
                disabled={resent}
              />
              <CodeInput
                label={smsMfa.code[locale]}
                required
                code={values.mfaCode}
                error={errors.mfaCode}
                setCode={(value) => handleChange(
                  'mfaCode',
                  value,
                )}
              />
            </>
          )}
          <SubmitError error={submitError} />
          <PrimaryButton
            title={smsMfa.verify[locale]}
            type='submit'
          />
        </section>
      </form>
      {currentNumber && allowFallbackToEmailMfa && (
        <SecondaryButton
          title={smsMfa.switchToEmail[locale]}
          onClick={() => onSwitchView(View.EmailMfa)}
        />
      )}
    </>
  )
}

export default SmsMfa

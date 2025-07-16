import { typeConfig } from 'configs'
import {
  ViewTitle, PhoneField, SecondaryButton, CodeInput, SubmitError, PrimaryButton, CheckboxInput,

} from 'pages/components'
import {
  InitialProps, View,
} from 'pages/hooks'
import { smsMfa } from 'pages/tools/locale'

export interface SmsMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
  onSubmit: (e: Event) => void;
  onChange: (name: 'phoneNumber' | 'mfaCode' | 'rememberDevice', value: string | string[] | boolean) => void;
  values: { phoneNumber: string; mfaCode: string[] | null; rememberDevice: boolean };
  errors: { phoneNumber: string | undefined; mfaCode: string | undefined };
  submitError: string | null;
  currentNumber: string | null;
  countryCode: string;
  allowFallbackToEmailMfa: boolean;
  resent: boolean;
  onResend: () => void;
  isSubmitting: boolean;
  isSending: boolean;
  initialProps: InitialProps;
}

const SmsMfa = ({
  locale,
  onSwitchView,
  onSubmit,
  onChange,
  values,
  errors,
  submitError,
  currentNumber,
  countryCode,
  allowFallbackToEmailMfa,
  resent,
  onResend,
  isSubmitting,
  isSending,
  initialProps,
}: SmsMfaProps) => {
  return (
    <>
      <ViewTitle
        title={smsMfa.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={onSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <PhoneField
            countryCode={countryCode}
            label={smsMfa.phoneNumber[locale]}
            required={!currentNumber}
            name='phoneNumber'
            value={currentNumber ?? values.phoneNumber}
            disabled={!!currentNumber}
            onChange={(value) => onChange(
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
                onClick={onResend}
                disabled={resent}
                isLoading={isSending}
              />
              <CodeInput
                label={smsMfa.code[locale]}
                required
                code={values.mfaCode}
                error={errors.mfaCode}
                setCode={(value) => onChange(
                  'mfaCode',
                  value,
                )}
              />
              {initialProps.enableMfaRememberDevice && (
                <CheckboxInput
                  id='rememberDevice'
                  label={smsMfa.rememberDevice[locale]}
                  checked={values.rememberDevice}
                  onChange={(value) => onChange(
                    'rememberDevice',
                    value,
                  )}
                />
              )}
            </>
          )}
          <SubmitError error={submitError} />
          <PrimaryButton
            title={smsMfa.verify[locale]}
            type='submit'
            isLoading={isSubmitting}
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

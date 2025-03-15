import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  CodeInput, PhoneField, PrimaryButton, SecondaryButton, SubmitError, ViewTitle,
} from 'pages/components'
import {
  useSubmitError, useSmsMfaForm, View,
} from 'pages/hooks'
import { smsMfa } from 'pages/tools/locale'

export interface SmsMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const SmsMfa = ({
  locale,
  onSwitchView,
}: SmsMfaProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    getSmsMfaInfo,
    currentNumber,
    allowFallbackToEmailMfa,
    countryCode,
    values,
    errors,
    handleChange,
    handleSubmit,
    handleResend,
    resent,
  } = useSmsMfaForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getSmsMfaInfo()
    },
    [getSmsMfaInfo],
  )

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
                code={values.mfaCode ?? []}
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

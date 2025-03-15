import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  SecondaryButton, ViewTitle, CheckboxInput,
  SubmitError,
} from 'pages/components'
import {
  usePasskeyEnrollForm, useSubmitError, View,
} from 'pages/hooks'
import { passkeyEnroll } from 'pages/tools/locale'

export interface PasskeyEnrollProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const PasskeyEnroll = ({
  locale,
  onSwitchView,
}: PasskeyEnrollProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    onSwitchView,
    locale,
  })

  const {
    getEnrollOptions,
    rememberSkip,
    handleRememberSkip,
    handleEnroll,
    handleDecline,
  } = usePasskeyEnrollForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getEnrollOptions()
    },
    [getEnrollOptions],
  )

  return (
    <>
      <script src='https://unpkg.com/@simplewebauthn/browser/dist/bundle/index.umd.min.js'></script>
      <ViewTitle title={passkeyEnroll.title[locale]} />
      <section class='mt-4 flex items-center justify-center gap-8 w-full'>
        <SecondaryButton
          title={passkeyEnroll.skip[locale]}
          onClick={handleDecline}
        />
        <SecondaryButton
          title={passkeyEnroll.enroll[locale]}
          onClick={handleEnroll}
        />
      </section>
      <SubmitError error={submitError} />
      <CheckboxInput
        id='skipPasskeyEnroll'
        label={passkeyEnroll.rememberSkip[locale]}
        checked={rememberSkip}
        onChange={handleRememberSkip}
      />
    </>
  )
}

export default PasskeyEnroll

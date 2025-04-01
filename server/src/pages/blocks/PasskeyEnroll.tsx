import {
  SubmitError, ViewTitle, SecondaryButton, CheckboxInput,
} from 'pages/components'
import { passkeyEnroll } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface PasskeyEnrollProps {
  locale: typeConfig.Locale;
  handleDecline: () => void;
  handleEnroll: () => void;
  submitError: string | null;
  rememberSkip: boolean;
  handleRememberSkip: (checked: boolean) => void;
}

const PasskeyEnroll = ({
  locale,
  handleDecline,
  handleEnroll,
  submitError,
  rememberSkip,
  handleRememberSkip,
}: PasskeyEnrollProps) => {
  return (
    <>
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

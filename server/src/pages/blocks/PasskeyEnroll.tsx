import {
  SubmitError, ViewTitle, SecondaryButton, CheckboxInput,
} from 'pages/components'
import { passkeyEnroll } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface PasskeyEnrollProps {
  locale: typeConfig.Locale;
  onDecline: () => void;
  onEnroll: () => void;
  submitError: string | null;
  rememberSkip: boolean;
  onRememberSkip: (checked: boolean) => void;
  isEnrolling: boolean;
  isDeclining: boolean;
}

const PasskeyEnroll = ({
  locale,
  onDecline,
  onEnroll,
  submitError,
  rememberSkip,
  onRememberSkip,
  isEnrolling,
  isDeclining,
}: PasskeyEnrollProps) => {
  return (
    <>
      <ViewTitle title={passkeyEnroll.title[locale]} />
      <section class='mt-4 flex items-center justify-center gap-8 w-full'>
        <SecondaryButton
          title={passkeyEnroll.skip[locale]}
          onClick={onDecline}
          isLoading={isDeclining}
        />
        <SecondaryButton
          title={passkeyEnroll.enroll[locale]}
          onClick={onEnroll}
          isLoading={isEnrolling}
        />
      </section>
      <SubmitError error={submitError} />
      <div class='flex items-center justify-center w-full'>
        <CheckboxInput
          id='skipPasskeyEnroll'
          label={passkeyEnroll.rememberSkip[locale]}
          checked={rememberSkip}
          onChange={onRememberSkip}
        />
      </div>
    </>
  )
}

export default PasskeyEnroll

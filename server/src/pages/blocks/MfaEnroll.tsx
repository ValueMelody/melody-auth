import { GetProcessMfaEnrollRes } from 'handlers/identity'
import { MfaType } from 'models/user'
import {
  SubmitError, ViewTitle,
  SecondaryButton,
} from 'pages/components'

import { mfaEnroll } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface MfaEnrollProps {
  locale: typeConfig.Locale;
  mfaEnrollInfo: GetProcessMfaEnrollRes | null;
  onEnroll: (mfaType: MfaType) => void;
  submitError: string | null;
  isEnrolling: boolean;
}

const MfaEnroll = ({
  locale,
  mfaEnrollInfo,
  onEnroll,
  submitError,
  isEnrolling,
}: MfaEnrollProps) => {
  return (
    <>
      <ViewTitle title={mfaEnroll.title[locale]} />
      <section class='flex flex-col justify-around w-full gap-4 mt-4'>
        {mfaEnrollInfo?.mfaTypes.map((mfaType) => (
          <SecondaryButton
            key={mfaType}
            title={mfaEnroll[mfaType][locale]}
            onClick={() => onEnroll(mfaType)}
            isLoading={isEnrolling}
          />
        ))}
      </section>
      <SubmitError error={submitError} />
    </>
  )
}

export default MfaEnroll

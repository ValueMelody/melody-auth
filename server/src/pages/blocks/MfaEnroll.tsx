import { GetProcessMfaEnrollRes } from 'handlers/identity'
import { MfaType } from 'models/user'
import {
  SubmitError, ViewTitle,
  SecondaryButton,
} from 'pages/components'

import { mfaEnroll } from 'pages/tools/locale'
import { typeConfig } from 'configs'

interface MfaEnrollProps {
  locale: typeConfig.Locale;
  mfaEnrollInfo: GetProcessMfaEnrollRes | null;
  handleEnroll: (mfaType: MfaType) => void;
  submitError: string | null;
}

const MfaEnroll = ({
  locale,
  mfaEnrollInfo,
  handleEnroll,
  submitError,
}: MfaEnrollProps) => {
  return (
    <>
      <ViewTitle title={mfaEnroll.title[locale]} />
      <section class='flex flex-col justify-around w-full gap-4 mt-4'>
        {mfaEnrollInfo?.mfaTypes.map((mfaType) => (
          <SecondaryButton
            key={mfaType}
            title={mfaEnroll[mfaType][locale]}
            onClick={() => handleEnroll(mfaType)}
          />
        ))}
      </section>
      <SubmitError error={submitError} />
    </>
  )
}

export default MfaEnroll

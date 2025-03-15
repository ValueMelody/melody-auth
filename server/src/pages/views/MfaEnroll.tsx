import { useEffect } from 'hono/jsx'
import {
  useSubmitError, View,
} from 'pages/hooks'
import { typeConfig } from 'configs'
import useMfaEnrollForm from 'pages/hooks/useMfaEnrollForm'
import {
  SecondaryButton, SubmitError, ViewTitle,
} from 'pages/components'
import { mfaEnroll } from 'pages/tools/locale'

export interface MfaEnrollProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const MfaEnroll = ({
  locale,
  onSwitchView,
}: MfaEnrollProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    mfaEnrollInfo,
    getMfaEnrollInfo,
    handleEnroll,
  } = useMfaEnrollForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getMfaEnrollInfo()
    },
    [getMfaEnrollInfo],
  )

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

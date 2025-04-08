import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  useManagePasskeyForm, useSubmitError, View,
} from 'pages/hooks'
import { ManagePasskey as ManagePasskeyBlock } from 'pages/blocks'

export interface ManagePasskeyProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ManagePasskey = ({
  locale,
  onSwitchView,
}: ManagePasskeyProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    successMessage, getManagePasskeyInfo, passkey, handleRemove, handleEnroll, redirectUri, isRemoving, isEnrolling,
  } = useManagePasskeyForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  useEffect(
    () => {
      getManagePasskeyInfo()
    },
    [getManagePasskeyInfo],
  )

  return (
    <ManagePasskeyBlock
      locale={locale}
      successMessage={successMessage}
      passkey={passkey}
      onRemove={handleRemove}
      onEnroll={handleEnroll}
      submitError={submitError}
      redirectUri={redirectUri}
      isRemoving={isRemoving}
      isEnrolling={isEnrolling}
    />
  )
}

export default ManagePasskey

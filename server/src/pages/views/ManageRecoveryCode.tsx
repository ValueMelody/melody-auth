import { typeConfig } from 'configs'
import {
  useManageRecoveryCodeForm, useSubmitError, View,
} from 'pages/hooks'
import { ManageRecoveryCode as ManageRecoveryCodeBlock } from 'pages/blocks'

export interface ManageRecoveryCodeProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ManageRecoveryCode = ({
  locale,
  onSwitchView,
}: ManageRecoveryCodeProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    successMessage, recoveryCode, handleRegenerate, redirectUri, isGenerating,
  } = useManageRecoveryCodeForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <ManageRecoveryCodeBlock
      locale={locale}
      successMessage={successMessage}
      recoveryCode={recoveryCode}
      onRegenerate={handleRegenerate}
      submitError={submitError}
      redirectUri={redirectUri}
      isGenerating={isGenerating}
    />
  )
}

export default ManageRecoveryCode

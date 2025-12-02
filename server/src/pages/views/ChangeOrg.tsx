import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  useSubmitError, View, useChangeOrgForm,
} from 'pages/hooks'
import { SwitchOrg as SwitchOrgBlock } from 'pages/blocks'

export interface ChangeOrgProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ChangeOrg = ({
  locale,
  onSwitchView,
}: ChangeOrgProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    orgs,
    activeOrgSlug,
    getUserOrgsInfo,
    handleSwitchOrg,
    isSwitching,
    success,
    resetSuccess,
    redirectUri,
  } = useChangeOrgForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getUserOrgsInfo()
    },
    [getUserOrgsInfo],
  )

  if (!activeOrgSlug) {
    return null
  }

  return (
    <SwitchOrgBlock
      locale={locale}
      orgs={orgs}
      activeOrgSlug={activeOrgSlug}
      onSwitchOrg={handleSwitchOrg}
      success={success}
      resetSuccess={resetSuccess}
      submitError={submitError}
      isSwitching={isSwitching}
      redirectUri={redirectUri}
    />
  )
}

export default ChangeOrg

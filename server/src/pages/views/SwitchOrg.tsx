import { useEffect } from 'hono/jsx'
import { typeConfig } from 'configs'
import {
  useSubmitError, View, useSwitchOrgForm,
} from 'pages/hooks'
import { SwitchOrg as SwitchOrgBlock } from 'pages/blocks'

export interface SwitchOrgProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const SwitchOrg = ({
  locale,
  onSwitchView,
}: SwitchOrgProps) => {
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
  } = useSwitchOrgForm({
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
      submitError={submitError}
      isSwitching={isSwitching}
    />
  )
}

export default SwitchOrg

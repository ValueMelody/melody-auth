import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import {
  routeConfig, typeConfig,
} from 'configs'
import { View } from 'pages/hooks'
import {
  handleAuthorizeStep,
  parseAuthorizeFollowUpValues,
  parseResponse,
} from 'pages/tools/request'
import { getFollowUpParams } from 'pages/tools/param'
import { GetProcessSwitchOrgRes } from 'handlers/identity/other'

export interface UseSwitchOrgFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useSwitchOrgForm = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UseSwitchOrgFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )

  const qs = `?code=${followUpParams.code}&locale=${locale}`

  const [orgs, setOrgs] = useState<GetProcessSwitchOrgRes['orgs']>([])
  const [activeOrgSlug, setActiveOrgSlug] = useState('')

  const [isSwitching, setIsSwitching] = useState(false)
  const handleSwitchOrg = useCallback(
    (orgSlug: string) => {
      setIsSwitching(true)
      fetch(
        routeConfig.IdentityRoute.ProcessSwitchOrg,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...parseAuthorizeFollowUpValues(
              followUpParams,
              locale,
            ),
            org: orgSlug,
          }),
        },
      )
        .then(parseResponse)
        .then((response) => {
          handleAuthorizeStep(
            response,
            locale,
            onSwitchView,
          )
        })
        .catch((error) => {
          onSubmitError(error)
        })
        .finally(() => {
          setIsSwitching(false)
        })
    },
    [
      onSubmitError,
      locale,
      followUpParams,
      onSwitchView,
    ],
  )

  const getUserOrgsInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.ProcessSwitchOrg}${qs}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(parseResponse)
        .then((response) => {
          setOrgs((response as GetProcessSwitchOrgRes).orgs as GetProcessSwitchOrgRes['orgs'])
          setActiveOrgSlug((response as GetProcessSwitchOrgRes).activeOrgSlug)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  return {
    orgs,
    activeOrgSlug,
    getUserOrgsInfo,
    handleSwitchOrg,
    isSwitching,
  }
}

export default useSwitchOrgForm

import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { AppDetail } from 'services/auth/api'

const useEditApp = (app: AppDetail | undefined) => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [scopes, setScopes] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [redirectUris, setRedirectUris] = useState([''])
  const [useSystemMfaConfig, setUseSystemMfaConfig] = useState(true)
  const [requireEmailMfa, setRequireEmailMfa] = useState(false)
  const [requireOtpMfa, setRequireOtpMfa] = useState(false)
  const [requireSmsMfa, setRequireSmsMfa] = useState(false)
  const [allowEmailMfaAsBackup, setAllowEmailMfaAsBackup] = useState(false)

  const values = useMemo(
    () => ({
      name,
      type,
      scopes,
      redirectUris,
      isActive,
      useSystemMfaConfig,
      requireEmailMfa,
      requireOtpMfa,
      requireSmsMfa,
      allowEmailMfaAsBackup,
    }),
    [
      name, type, scopes, redirectUris, isActive,
      useSystemMfaConfig, requireEmailMfa, requireOtpMfa, requireSmsMfa, allowEmailMfaAsBackup,
    ],
  )

  useEffect(
    () => {
      setName(app?.name ?? '')
      setType(app?.type ?? '')
      setScopes(app?.scopes ?? [])
      setIsActive(app?.isActive ?? true)
      setRedirectUris(app?.redirectUris ?? [''])
      setUseSystemMfaConfig(app?.useSystemMfaConfig ?? true)
      setRequireEmailMfa(app?.requireEmailMfa ?? false)
      setRequireOtpMfa(app?.requireOtpMfa ?? false)
      setRequireSmsMfa(app?.requireSmsMfa ?? false)
      setAllowEmailMfaAsBackup(app?.allowEmailMfaAsBackup ?? false)
    },
    [app],
  )

  const errors = useMemo(
    () => ({
      name: values.name.trim().length ? undefined : t('common.fieldIsRequired'),
      type: values.type ? undefined : t('common.fieldIsRequired'),
      scopes: values.scopes.length ? undefined : t('common.fieldIsRequired'),
    }),
    [values, t],
  )

  const onChange = (
    key: string, value: string | string[] | boolean,
  ) => {
    switch (key) {
    case 'name':
      setName(value as string)
      break
    case 'type':
      setType(value as string)
      break
    case 'scopes':
      setScopes(value as string[])
      break
    case 'isActive':
      setIsActive(value as boolean)
      break
    case 'redirectUris':
      setRedirectUris(value as string[])
      break
    case 'useSystemMfaConfig':
      setUseSystemMfaConfig(value as boolean)
      if (value) {
        setRequireEmailMfa(false)
        setRequireOtpMfa(false)
        setRequireSmsMfa(false)
        setAllowEmailMfaAsBackup(false)
      }
      break
    case 'requireEmailMfa':
      setRequireEmailMfa(value as boolean)
      break
    case 'requireOtpMfa':
      setRequireOtpMfa(value as boolean)
      break
    case 'requireSmsMfa':
      setRequireSmsMfa(value as boolean)
      break
    case 'allowEmailMfaAsBackup':
      setAllowEmailMfaAsBackup(value as boolean)
      break
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditApp

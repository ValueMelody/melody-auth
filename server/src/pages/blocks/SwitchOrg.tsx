import { useState } from 'hono/jsx'
import { GetProcessSwitchOrgRes } from 'handlers/identity'
import {
  SubmitError, ViewTitle,
  SecondaryButton,
  PrimaryButton,
  SuccessMessage,
} from 'pages/components'
import { switchOrg } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface SwitchOrgProps {
  locale: typeConfig.Locale;
  orgs: GetProcessSwitchOrgRes['orgs'];
  activeOrgSlug: GetProcessSwitchOrgRes['activeOrgSlug'];
  onSwitchOrg: (orgSlug: string) => void;
  submitError: string | null;
  isSwitching: boolean;
  success?: boolean;
  resetSuccess?: () => void;
  redirectUri?: string;
}

const CheckIcon = () => (
  <svg
    viewBox='0 0 24 24'
    width={24}
    height={24}
    fill='none'
    stroke='blue'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M5 13l4 4L19 7' />
  </svg>
)

const SwitchOrg = ({
  locale,
  orgs,
  activeOrgSlug,
  onSwitchOrg,
  submitError,
  isSwitching,
  success,
  resetSuccess,
  redirectUri,
}: SwitchOrgProps) => {
  const [activeSlug, setActiveSlug] = useState(activeOrgSlug)

  const handleClickOrg = (orgSlug: string) => {
    if (activeSlug === orgSlug) { return }
    if (resetSuccess && success) { resetSuccess() }
    setActiveSlug(orgSlug)
  }

  return (
    <>
      {success && (
        <div className='flex justify-center w-full'>
          <SuccessMessage
            message={switchOrg.success[locale]}
          />
        </div>
      )}
      <ViewTitle title={switchOrg.title[locale]} />
      <section class='flex flex-col justify-around w-full gap-4 mt-4'>
        {orgs?.map((org) => (
          <PrimaryButton
            type='button'
            key={org.slug}
            title={(
              <div className='flex justify-center '>
                {org.name}
                {activeSlug === org.slug && <CheckIcon />}
              </div>
            )}
            onClick={() => handleClickOrg(org.slug)}
            disabled={isSwitching}
          />
        ))}
      </section>
      {activeSlug && (
        <SecondaryButton
          title={switchOrg.confirm[locale]}
          disabled={isSwitching}
          onClick={() => onSwitchOrg(activeSlug)}
        />
      )}
      <SubmitError error={submitError} />
      {redirectUri && (
        <a
          class='button-secondary mt-6'
          href={redirectUri}
        >
          {switchOrg.redirect[locale]}
        </a>
      )}
    </>
  )
}

export default SwitchOrg

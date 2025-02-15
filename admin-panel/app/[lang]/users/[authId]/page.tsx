'use client'

import {
  Badge, Button, Card, Checkbox, Label, Select, Table,
  TableCell,
  TextInput,
  ToggleSwitch,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useEffect, useMemo, useState,
} from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/16/solid'
import UserEmailVerified from 'components/UserEmailVerified'
import { routeTool } from 'tools'
import EntityStatusLabel from 'components/EntityStatusLabel'
import useSignalValue from 'app/useSignalValue'
import {
  userInfoSignal, configSignal,
} from 'signals'
import IsSelfLabel from 'components/IsSelfLabel'
import PageTitle from 'components/PageTitle'
import SubmitError from 'components/SubmitError'
import SaveButton from 'components/SaveButton'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import {
  PutUserReq,
  useDeleteApiV1UsersByAuthIdAccountLinkingMutation,
  useDeleteApiV1UsersByAuthIdConsentedAppsAndAppIdMutation,
  useDeleteApiV1UsersByAuthIdEmailMfaMutation,
  useDeleteApiV1UsersByAuthIdLockedIpsMutation,
  useDeleteApiV1UsersByAuthIdMutation,
  useDeleteApiV1UsersByAuthIdOtpMfaMutation,
  useDeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdMutation,
  useDeleteApiV1UsersByAuthIdSmsMfaMutation,
  useGetApiV1RolesQuery,
  useGetApiV1UsersByAuthIdConsentedAppsQuery,
  useGetApiV1UsersByAuthIdLockedIpsQuery,
  useGetApiV1UsersByAuthIdPasskeysQuery,
  useGetApiV1UsersByAuthIdQuery,
  usePostApiV1UsersByAuthIdEmailMfaMutation,
  usePostApiV1UsersByAuthIdOtpMfaMutation,
  usePostApiV1UsersByAuthIdSmsMfaMutation,
  usePostApiV1UsersByAuthIdVerifyEmailMutation,
  usePutApiV1UsersByAuthIdMutation,
  UserDetail,
} from 'services/auth/api'
import ConfirmModal from 'components/ConfirmModal'

const Page = () => {
  const { authId } = useParams()
  const configs = useSignalValue(configSignal)

  const t = useTranslations()
  const router = useLocaleRouter()

  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)
  const [locale, setLocale] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [emailResent, setEmailResent] = useState(false)
  const [userRoles, setUserRoles] = useState<string[] | null>([])

  const [isUnlinking, setIsUnlinking] = useState(false)
  const [isResettingSmsMfa, setIsResettingSmsMfa] = useState(false)
  const [isResettingOtpMfa, setIsResettingOtpMfa] = useState(false)
  const [isResettingEmailMfa, setIsResettingEmailMfa] = useState(false)
  const [isRemovingPasskey, setIsRemovingPasskey] = useState(false)

  const userInfo = useSignalValue(userInfoSignal)
  const enableConsent = !!configs.ENABLE_USER_APP_CONSENT
  const enableAccountLock = !!configs.ACCOUNT_LOCKOUT_THRESHOLD
  const enablePasskeyEnrollment = !!configs.ALLOW_PASSKEY_ENROLLMENT

  const { data: userData } = useGetApiV1UsersByAuthIdQuery({ authId: String(authId) })
  const user = userData?.user

  const { data: rolesData } = useGetApiV1RolesQuery()
  const roles = rolesData?.roles ?? []

  const { data: consentsData } = useGetApiV1UsersByAuthIdConsentedAppsQuery(
    { authId: String(authId) },
    { skip: !enableConsent },
  )
  const consentedApps = consentsData?.consentedApps ?? []

  const { data: passkeysData } = useGetApiV1UsersByAuthIdPasskeysQuery(
    { authId: String(authId) },
    { skip: !enablePasskeyEnrollment },
  )
  const passkeys = passkeysData?.passkeys ?? []

  const { data: lockedIPsData } = useGetApiV1UsersByAuthIdLockedIpsQuery(
    { authId: String(authId) },
    { skip: !enableAccountLock },
  )
  const lockedIPs = lockedIPsData?.lockedIPs ?? []

  const isEmailEnrolled = configs.EMAIL_MFA_IS_REQUIRED || user?.mfaTypes.includes('email')
  const isOtpEnrolled = configs.OTP_MFA_IS_REQUIRED || user?.mfaTypes.includes('otp')
  const isSmsEnrolled = configs.SMS_MFA_IS_REQUIRED || user?.mfaTypes.includes('sms')

  const [updateUser, { isLoading: isUpdating }] = usePutApiV1UsersByAuthIdMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteApiV1UsersByAuthIdMutation()
  const [deleteUserConsent] = useDeleteApiV1UsersByAuthIdConsentedAppsAndAppIdMutation()
  const [deleteUserLockedIps] = useDeleteApiV1UsersByAuthIdLockedIpsMutation()
  const [resendVerificationEmail] = usePostApiV1UsersByAuthIdVerifyEmailMutation()
  const [enrollEmailMfa] = usePostApiV1UsersByAuthIdEmailMfaMutation()
  const [enrollOtpMfa] = usePostApiV1UsersByAuthIdOtpMfaMutation()
  const [enrollSmsMfa] = usePostApiV1UsersByAuthIdSmsMfaMutation()
  const [unenrollEmailMfa] = useDeleteApiV1UsersByAuthIdEmailMfaMutation()
  const [unenrollSmsMfa] = useDeleteApiV1UsersByAuthIdSmsMfaMutation()
  const [unenrollOtpMfa] = useDeleteApiV1UsersByAuthIdOtpMfaMutation()
  const [unlinkAccount] = useDeleteApiV1UsersByAuthIdAccountLinkingMutation()
  const [deletePasskey] = useDeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdMutation()

  const updateObj = useMemo(
    () => {
      if (!user) return {} as PutUserReq
      const obj: PutUserReq = {}
      if (userRoles !== user.roles) obj.roles = userRoles ?? []
      if (isActive !== user.isActive) obj.isActive = isActive
      if (firstName !== user.firstName) obj.firstName = firstName ?? ''
      if (lastName !== user.lastName) obj.lastName = lastName ?? ''
      if (locale !== user.locale) obj.locale = locale
      return obj
    },
    [user, userRoles, isActive, firstName, lastName, locale],
  )

  const isSelf = useMemo(
    () => userInfo.authId === user?.authId,
    [user, userInfo],
  )

  const handleDelete = async () => {
    await deleteUser({ authId: String(authId) })
    router.push(routeTool.Internal.Users)
  }

  const handleDeleteConsent = async (appId: number) => {
    await deleteUserConsent({
      authId: String(authId),
      appId,
    })
  }

  const handleUnlock = async () => {
    await deleteUserLockedIps({ authId: String(authId) })
  }

  useEffect(
    () => {
      if (user) {
        setFirstName(user.firstName)
        setLastName(user.lastName)
        setIsActive(user.isActive)
        setUserRoles(user.roles)
        setLocale(user.locale)
      }
    },
    [user],
  )

  const handleSave = async () => {
    await updateUser({
      authId: String(authId),
      putUserReq: updateObj,
    })
  }

  const handleResendVerifyEmail = async () => {
    const res = await resendVerificationEmail({ authId: String(authId) })
    if (res.data?.success) setEmailResent(true)
  }

  const handleClickResetOtpMfa = () => setIsResettingOtpMfa(true)

  const handleCancelResetOtpMfa = () => setIsResettingOtpMfa(false)

  const handleConfirmResetOtpMfa = async () => {
    await unenrollOtpMfa({ authId: String(authId) })
    setIsResettingOtpMfa(false)
  }

  const handleClickResetSmsMfa = () => setIsResettingSmsMfa(true)

  const handleCancelResetSmsMfa = () => setIsResettingSmsMfa(false)

  const handleConfirmResetSmsMfa = async () => {
    await unenrollSmsMfa({ authId: String(authId) })
    setIsResettingSmsMfa(false)
  }

  const handleClickResetEmailMfa = () => setIsResettingEmailMfa(true)

  const handleCancelResetEmailMfa = () => setIsResettingEmailMfa(false)

  const handleConfirmResetEmailMfa = async () => {
    await unenrollEmailMfa({ authId: String(authId) })
    setIsResettingEmailMfa(false)
  }

  const handleEnrollOtpMfa = async () => {
    await enrollOtpMfa({ authId: String(authId) })
  }

  const handleEnrollSmsMfa = async () => {
    await enrollSmsMfa({ authId: String(authId) })
  }

  const handleEnrollEmailMfa = async () => {
    await enrollEmailMfa({ authId: String(authId) })
  }

  const handleCancelUnlink = () => setIsUnlinking(false)

  const handleClickUnlink = () => setIsUnlinking(true)

  const handleConfirmUnlink = async () => {
    await unlinkAccount({ authId: String(authId) })
    setIsUnlinking(false)
  }

  const handleClickRemovePasskey = () => setIsRemovingPasskey(true)

  const handleCancelRemovePasskey = () => setIsRemovingPasskey(false)

  const handleConfirmRemovePasskey = async () => {
    await deletePasskey({
      authId: String(authId), passkeyId: passkeys[0].id,
    })
    setIsRemovingPasskey(false)
  }

  const handleToggleUserRole = (role: string) => {
    const newRoles = userRoles?.includes(role)
      ? userRoles.filter((userRole) => role !== userRole)
      : [...(userRoles ?? []), role]
    setUserRoles(newRoles)
  }

  const handleClickLinkedAccount = () => {
    router.push(`${routeTool.Internal.Users}/${user?.linkedAuthId}`)
  }

  const renderEmailButtons = (user: UserDetail) => {
    if (user.socialAccountId) return null
    return (
      <div className='flex items-center gap-4 max-md:gap-2 max-md:flex-col max-md:items-start'>
        {user.isActive && !isEmailEnrolled && (
          <Button
            size='xs'
            data-testid='enrollEmailButton'
            onClick={handleEnrollEmailMfa}>
            {t('users.enrollMfa')}
          </Button>
        )}
        {user.isActive && isEmailEnrolled && !configs.EMAIL_MFA_IS_REQUIRED && (
          <Button
            size='xs'
            data-testid='resetEmailButton'
            onClick={handleClickResetEmailMfa}>
            {t('users.resetMfa')}
          </Button>
        )}
        {configs.ENABLE_EMAIL_VERIFICATION && user.isActive && !user.emailVerified && !emailResent && (
          <Button
            size='xs'
            onClick={handleResendVerifyEmail}
            data-testid='resendEmailButton'>
            {t('users.resend')}
          </Button>
        )}
        {configs.ENABLE_EMAIL_VERIFICATION && user.isActive && !user.emailVerified && emailResent && (
          <div className='flex'>
            <Badge data-testid='emailSentBadge'>{t('users.sent')}</Badge>
          </div>
        )}
      </div>
    )
  }

  const renderOtpButtons = (user: UserDetail) => {
    return (
      <>
        {user.mfaTypes.includes('otp') && user.isActive && (
          <Button
            size='xs'
            data-testid='resetOtpButton'
            onClick={handleClickResetOtpMfa}
          >
            {t('users.resetMfa')}
          </Button>
        )}
        {user.isActive && !isOtpEnrolled && (
          <Button
            size='xs'
            data-testid='enrollOtpButton'
            onClick={handleEnrollOtpMfa}>
            {t('users.enrollMfa')}
          </Button>
        )}
      </>
    )
  }

  const renderSmsButtons = (user: UserDetail) => {
    return (
      <>
        {user.mfaTypes.includes('sms') && user.isActive && (
          <Button
            size='xs'
            data-testid='resetSmsButton'
            onClick={handleClickResetSmsMfa}
          >
            {t('users.resetMfa')}
          </Button>
        )}
        {user.isActive && !isSmsEnrolled && (
          <Button
            size='xs'
            data-testid='enrollSmsButton'
            onClick={handleEnrollSmsMfa}>
            {t('users.enrollMfa')}
          </Button>
        )}
      </>
    )
  }

  const renderIpButtons = (lockedIPs: string[]) => {
    if (!lockedIPs.length) return null
    return (
      <Button
        size='xs'
        data-testid='unlockIpButton'
        onClick={handleUnlock}
      >
        {t('users.unlock')}
      </Button>
    )
  }

  const renderUnlinkAccountButtons = () => {
    return (
      <Button
        size='xs'
        onClick={handleClickUnlink}
      >
        {t('users.unlink')}
      </Button>
    )
  }

  const renderRemovePasskeyButton = () => {
    return (
      <Button
        size='xs'
        onClick={handleClickRemovePasskey}
      >
        {t('users.removePasskey')}
      </Button>
    )
  }

  if (!user) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('users.user')}
      />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell className='w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
            <Table.HeadCell className='w-96 max-md:hidden' />
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('users.authId')}</Table.Cell>
              <Table.Cell>
                <div className='flex items-center gap-2 max-md:flex-col max-md:items-start'>
                  {user.authId}
                  {isSelf && (
                    <IsSelfLabel />
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
            {user.email && (
              <Table.Row>
                <Table.Cell>{t('users.email')}</Table.Cell>
                <Table.Cell>
                  <ConfirmModal
                    title={t('users.resetEmailMfaTitle')}
                    show={isResettingEmailMfa}
                    onConfirm={handleConfirmResetEmailMfa}
                    onClose={handleCancelResetEmailMfa}
                    confirmButtonText={t('users.resetMfa')}
                  />
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-4 max-md:gap-2 max-md:flex-col max-md:items-start'>
                      <p>{user.email}</p>
                      {configs.ENABLE_EMAIL_VERIFICATION && (
                        <UserEmailVerified user={user} />
                      )}
                      {isEmailEnrolled && (
                        <Badge color='gray'>{t('users.emailMfaEnrolled')}</Badge>
                      )}
                      <div className='md:hidden'>
                        {renderEmailButtons(user)}
                      </div>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className='max-md:hidden'>
                  {renderEmailButtons(user)}
                </Table.Cell>
              </Table.Row>
            )}
            {user.socialAccountId && (
              <Table.Row>
                <Table.Cell>{t('users.social')}</Table.Cell>
                <Table.Cell>{user.socialAccountType}: {user.socialAccountId}</Table.Cell>
              </Table.Row>
            )}
            {!user.socialAccountId && (
              <Table.Row>
                <ConfirmModal
                  title={t('users.resetOtpMfaTitle')}
                  show={isResettingOtpMfa}
                  onConfirm={handleConfirmResetOtpMfa}
                  onClose={handleCancelResetOtpMfa}
                  confirmButtonText={t('users.resetMfa')}
                />
                <Table.Cell>{t('users.otpMfa')}</Table.Cell>
                <TableCell>
                  <div className='flex max-md:flex-col gap-2'>
                    {isOtpEnrolled && !user.otpVerified && (
                      <div className='flex'>
                        <Badge color='gray'>{t('users.otpMfaEnrolled')}</Badge>
                      </div>
                    )}
                    {isOtpEnrolled && user.otpVerified && (
                      <div className='flex'>
                        <Badge color='success'>{t('users.otpMfaVerified')}</Badge>
                      </div>
                    )}
                    <div className='md:hidden'>
                      {renderOtpButtons(user)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='max-md:hidden'>
                  {renderOtpButtons(user)}
                </TableCell>
              </Table.Row>
            )}
            {!user.socialAccountId && (
              <Table.Row>
                <ConfirmModal
                  title={t('users.resetSmsMfaTitle')}
                  show={isResettingSmsMfa}
                  onConfirm={handleConfirmResetSmsMfa}
                  onClose={handleCancelResetSmsMfa}
                  confirmButtonText={t('users.resetMfa')}
                />
                <Table.Cell>{t('users.smsMfa')}</Table.Cell>
                <TableCell>
                  <div className='flex max-md:flex-col gap-2'>
                    {isSmsEnrolled && !user.smsPhoneNumberVerified && (
                      <div className='flex'>
                        <Badge color='gray'>{t('users.smsMfaEnrolled')}</Badge>
                      </div>
                    )}
                    {isSmsEnrolled && user.smsPhoneNumberVerified && (
                      <div className='flex'>
                        <Badge color='success'>{t('users.smsMfaVerified')}</Badge>
                      </div>
                    )}
                    <div className='md:hidden'>
                      {renderSmsButtons(user)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='max-md:hidden'>
                  {renderSmsButtons(user)}
                </TableCell>
              </Table.Row>
            )}
            {!user.socialAccountId && enablePasskeyEnrollment && (
              <Table.Row>
                <ConfirmModal
                  title={t('users.removePasskeyTitle')}
                  show={isRemovingPasskey}
                  onConfirm={handleConfirmRemovePasskey}
                  onClose={handleCancelRemovePasskey}
                  confirmButtonText={t('users.removePasskey')}
                />
                <Table.Cell>{t('users.passkey')}</Table.Cell>
                <TableCell>
                  {!!passkeys.length && (
                    <div className='flex max-md:flex-col gap-2'>
                      <Badge color='gray'>{t('users.passkeyEnrolled')}</Badge>
                      <div className='md:hidden'>
                        {renderRemovePasskeyButton()}
                      </div>
                    </div>
                  )}
                </TableCell>
                {!!passkeys.length && (
                  <TableCell className='max-md:hidden'>
                    {renderRemovePasskeyButton()}
                  </TableCell>
                )}
              </Table.Row>
            )}
            {user.linkedAuthId && (
              <Table.Row>
                <ConfirmModal
                  title={t('users.unlinkTitle')}
                  show={isUnlinking}
                  onConfirm={handleConfirmUnlink}
                  onClose={handleCancelUnlink}
                  confirmButtonText={t('users.unlink')}
                />
                <Table.Cell>{t('users.linkedWith')}</Table.Cell>
                <Table.Cell>
                  <div className='flex max-md:flex-col gap-2'>
                    <a
                      className='text-cyan-600 cursor-pointer flex items-center gap-1'
                      onClick={handleClickLinkedAccount}
                    >
                      {user.linkedAuthId}
                      <ArrowTopRightOnSquareIcon className='w-4 h-4' />
                    </a>
                    <div className='md:hidden'>
                      {renderUnlinkAccountButtons()}
                    </div>
                  </div>
                </Table.Cell>
                <TableCell className='max-md:hidden'>
                  {renderUnlinkAccountButtons()}
                </TableCell>
              </Table.Row>
            )}
            <Table.Row>
              <Table.Cell>{t('users.locale')}</Table.Cell>
              <Table.Cell>
                {configs.SUPPORTED_LOCALES.length > 1 && (
                  <Select
                    data-testid='localeSelect'
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                  >
                    <option disabled></option>
                    {configs.SUPPORTED_LOCALES.map((locale: string) => (
                      <option
                        key={locale}
                        data-testid='localeOption'
                        value={locale}>{locale.toUpperCase()}
                      </option>
                    ))}
                  </Select>
                )}
                {configs.SUPPORTED_LOCALES.length <= 1 && user.locale}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.loginCount')}</Table.Cell>
              <Table.Cell>{user.loginCount}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.status')}</Table.Cell>
              <Table.Cell>
                {isSelf && <EntityStatusLabel isEnabled={user.isActive} />}
                {!isSelf && (
                  <ToggleSwitch
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                )}
              </Table.Cell>
            </Table.Row>
            {!user.socialAccountId && enableAccountLock && (
              <Table.Row>
                <Table.Cell>{t('users.lockedIPs')}</Table.Cell>
                <Table.Cell>
                  <div className='flex max-md:flex-col gap-2'>
                    <div className='flex items-center gap-6'>
                      {lockedIPs?.map((ip) => (
                        <Badge
                          data-testid='lockedIpBadge'
                          color='gray'
                          key={ip}>{ip || t('users.noIP')}
                        </Badge>
                      ))}
                    </div>
                    <div className='md:hidden'>
                      {renderIpButtons(lockedIPs)}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className='max-md:hidden'>
                  {renderIpButtons(lockedIPs)}
                </Table.Cell>
              </Table.Row>
            )}
            <Table.Row>
              <Table.Cell>{t('users.roles')}</Table.Cell>
              <Table.Cell>
                <div className='flex items-center flex-wrap gap-6 max-md:flex-col max-md:items-start'>
                  {roles?.map((role) => (
                    <div
                      key={role.id}
                      className='flex items-center gap-2'>
                      <Checkbox
                        id={`role-${role.id}`}
                        data-testid='roleInput'
                        onChange={() => handleToggleUserRole(role.name)}
                        checked={userRoles?.includes(role.name) ?? false}
                      />
                      <Label
                        htmlFor={`role-${role.id}`}
                        className='flex'>
                        {role.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </Table.Cell>
            </Table.Row>
            {configs.ENABLE_ORG && (
              <Table.Row>
                <Table.Cell>{t('users.org')}</Table.Cell>
                <Table.Cell>
                  {user.org?.name ?? ''}
                </Table.Cell>
              </Table.Row>
            )}
            {configs.ENABLE_NAMES && (
              <>
                <Table.Row>
                  <Table.Cell>{t('users.firstName')}</Table.Cell>
                  <Table.Cell>
                    <TextInput
                      data-testid='firstNameInput'
                      onChange={(e) => setFirstName(e.target.value)}
                      value={firstName ?? ''}
                    />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('users.lastName')}</Table.Cell>
                  <Table.Cell>
                    <TextInput
                      data-testid='lastNameInput'
                      onChange={(e) => setLastName(e.target.value)}
                      value={lastName ?? ''}
                    />
                  </Table.Cell>
                </Table.Row>
              </>
            )}
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{user.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{user.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
      <SubmitError />
      <section className='flex items-center gap-4 mt-8'>
        <SaveButton
          isLoading={isUpdating}
          disabled={!Object.keys(updateObj).length || isDeleting}
          onClick={handleSave}
        />
        <DeleteButton
          isLoading={isDeleting}
          disabled={isUpdating}
          confirmDeleteTitle={t(
            'common.deleteConfirm',
            { item: user.email },
          )}
          onConfirmDelete={handleDelete}
        />
      </section>
      {enableConsent && (
        <>
          <h2 className='font-semibold mt-8'>{t('users.consented')}</h2>
          <section className='flex items-center gap-4 mt-4'>
            {consentedApps.map((consented) => (
              <Card key={consented.appId}>
                {consented.appName}
                <DeleteButton
                  onConfirmDelete={() => handleDeleteConsent(consented.appId)}
                  size='xs'
                  buttonText={t('users.revokeConsent')}
                  confirmDeleteTitle={t(
                    'users.confirmRevoke',
                    { item: consented.appName },
                  )}
                />
              </Card>
            ))}
            {!consentedApps.length && (
              <p>{t('users.noConsented')}</p>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default Page

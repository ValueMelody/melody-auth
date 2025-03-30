'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useEffect, useMemo, useState,
} from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/16/solid'
import { useAuth } from '@melody-auth/react'
import {
  Card, CardHeader, CardTitle, CardContent,
} from 'components/ui/card'
import { Switch } from 'components/ui/switch'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from 'components/ui/select'
import { Checkbox } from 'components/ui/checkbox'
import { Input } from 'components/ui/input'
import { Button } from 'components/ui/button'
import { Label } from 'components/ui/label'
import { Badge } from 'components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import UserEmailVerified from 'components/UserEmailVerified'
import { routeTool } from 'tools'
import EntityStatusLabel from 'components/EntityStatusLabel'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'
import IsSelfLabel from 'components/IsSelfLabel'
import SubmitError from 'components/SubmitError'
import SaveButton from 'components/SaveButton'
import DeleteButton from 'components/DeleteButton'
import { useRouter } from 'i18n/navigation'
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
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'

const Page = () => {
  const { authId } = useParams()
  const configs = useSignalValue(configSignal)

  const { userInfo } = useAuth()

  const t = useTranslations()
  const router = useRouter()

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

  const enableConsent = !!configs.ENABLE_USER_APP_CONSENT
  const enableAccountLock = !!configs.ACCOUNT_LOCKOUT_THRESHOLD
  const enablePasskeyEnrollment = !!configs.ALLOW_PASSKEY_ENROLLMENT

  const {
    data: userData, isLoading: isUserLoading,
  } = useGetApiV1UsersByAuthIdQuery({ authId: String(authId) })
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
    () => userInfo?.authId === user?.authId,
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
            size='sm'
            data-testid='enrollEmailButton'
            onClick={handleEnrollEmailMfa}>
            {t('users.enrollMfa')}
          </Button>
        )}
        {user.isActive && isEmailEnrolled && !configs.EMAIL_MFA_IS_REQUIRED && (
          <Button
            size='sm'
            data-testid='resetEmailButton'
            onClick={handleClickResetEmailMfa}>
            {t('users.resetMfa')}
          </Button>
        )}
        {configs.ENABLE_EMAIL_VERIFICATION && user.isActive && !user.emailVerified && !emailResent && (
          <Button
            size='sm'
            onClick={handleResendVerifyEmail}
            data-testid='resendEmailButton'>
            {t('users.resend')}
          </Button>
        )}
        {configs.ENABLE_EMAIL_VERIFICATION && user.isActive && !user.emailVerified && emailResent && (
          <div className='flex'>
            <Badge
              data-testid='emailSentBadge'
              variant='secondary'>{t('users.sent')}</Badge>
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
            size='sm'
            data-testid='resetOtpButton'
            onClick={handleClickResetOtpMfa}
          >
            {t('users.resetMfa')}
          </Button>
        )}
        {user.isActive && !isOtpEnrolled && (
          <Button
            size='sm'
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
            size='sm'
            data-testid='resetSmsButton'
            onClick={handleClickResetSmsMfa}
          >
            {t('users.resetMfa')}
          </Button>
        )}
        {user.isActive && !isSmsEnrolled && (
          <Button
            size='sm'
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
        size='sm'
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
        size='sm'
        onClick={handleClickUnlink}
      >
        {t('users.unlink')}
      </Button>
    )
  }

  const renderRemovePasskeyButton = () => {
    return (
      <Button
        size='sm'
        onClick={handleClickRemovePasskey}
      >
        {t('users.removePasskey')}
      </Button>
    )
  }

  if (isUserLoading) return <LoadingPage />

  if (!user) return null

  return (
    <section>
      <Breadcrumb
        page={{ label: t('users.user') }}
        parent={{
          label: t('users.title'),
          href: routeTool.Internal.Users,
        }}
        className='mb-8'
      />
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-48'>{t('common.property')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
              <TableHead className='w-96 max-md:hidden' />
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y'>
            <TableRow>
              <TableCell>{t('users.authId')}</TableCell>
              <TableCell>
                <div className='flex items-center gap-2 max-md:flex-col max-md:items-start'>
                  {user.authId}
                  {isSelf && (
                    <IsSelfLabel />
                  )}
                </div>
              </TableCell>
            </TableRow>
            {user.email && (
              <TableRow>
                <TableCell>{t('users.email')}</TableCell>
                <TableCell>
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
                        <Badge variant='secondary'>{t('users.emailMfaEnrolled')}</Badge>
                      )}
                      <div className='md:hidden'>
                        {renderEmailButtons(user)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='max-md:hidden'>
                  {renderEmailButtons(user)}
                </TableCell>
              </TableRow>
            )}
            {user.socialAccountId && (
              <TableRow>
                <TableCell>{t('users.social')}</TableCell>
                <TableCell>{user.socialAccountType}: {user.socialAccountId}</TableCell>
              </TableRow>
            )}
            {!user.socialAccountId && (
              <>
                <ConfirmModal
                  title={t('users.resetOtpMfaTitle')}
                  show={isResettingOtpMfa}
                  onConfirm={handleConfirmResetOtpMfa}
                  onClose={handleCancelResetOtpMfa}
                  confirmButtonText={t('users.resetMfa')}
                />
                <TableRow>
                  <TableCell>{t('users.otpMfa')}</TableCell>
                  <TableCell>
                    <div className='flex max-md:flex-col gap-2'>
                      {isOtpEnrolled && !user.otpVerified && (
                        <div className='flex'>
                          <Badge variant='secondary'>{t('users.otpMfaEnrolled')}</Badge>
                        </div>
                      )}
                      {isOtpEnrolled && user.otpVerified && (
                        <div className='flex'>
                          <Badge>{t('users.otpMfaVerified')}</Badge>
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
                </TableRow>
              </>
            )}
            {!user.socialAccountId && (
              <>
                <ConfirmModal
                  title={t('users.resetSmsMfaTitle')}
                  show={isResettingSmsMfa}
                  onConfirm={handleConfirmResetSmsMfa}
                  onClose={handleCancelResetSmsMfa}
                  confirmButtonText={t('users.resetMfa')}
                />
                <TableRow>
                  <TableCell>{t('users.smsMfa')}</TableCell>
                  <TableCell>
                    <div className='flex max-md:flex-col gap-2'>
                      {isSmsEnrolled && !user.smsPhoneNumberVerified && (
                        <div className='flex'>
                          <Badge variant='secondary'>{t('users.smsMfaEnrolled')}</Badge>
                        </div>
                      )}
                      {isSmsEnrolled && user.smsPhoneNumberVerified && (
                        <div className='flex'>
                          <Badge>{t('users.smsMfaVerified')}</Badge>
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
                </TableRow>
              </>
            )}
            {!user.socialAccountId && enablePasskeyEnrollment && (
              <>
                <ConfirmModal
                  title={t('users.removePasskeyTitle')}
                  show={isRemovingPasskey}
                  onConfirm={handleConfirmRemovePasskey}
                  onClose={handleCancelRemovePasskey}
                  confirmButtonText={t('users.removePasskey')}
                />
                <TableRow>
                  <TableCell>{t('users.passkey')}</TableCell>
                  <TableCell>
                    {!!passkeys.length && (
                      <div className='flex max-md:flex-col gap-2'>
                        <Badge variant='secondary'>{t('users.passkeyEnrolled')}</Badge>
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
                </TableRow>
              </>
            )}
            {user.linkedAuthId && (
              <>
                <ConfirmModal
                  title={t('users.unlinkTitle')}
                  show={isUnlinking}
                  onConfirm={handleConfirmUnlink}
                  onClose={handleCancelUnlink}
                  confirmButtonText={t('users.unlink')}
                />
                <TableRow>
                  <TableCell>{t('users.linkedWith')}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className='max-md:hidden'>
                    {renderUnlinkAccountButtons()}
                  </TableCell>
                </TableRow>
              </>
            )}
            <TableRow>
              <TableCell>{t('users.locale')}</TableCell>
              <TableCell>
                {configs.SUPPORTED_LOCALES.length > 1 && (
                  <Select
                    value={locale}
                    onValueChange={(val) => setLocale(val)}
                  >
                    <SelectTrigger
                      data-testid='localeSelect'
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {configs.SUPPORTED_LOCALES.map((locale: string) => (
                          <SelectItem
                            key={locale}
                            data-testid={`localeOption-${locale}`}
                            value={locale}
                          >
                            {locale.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
                {configs.SUPPORTED_LOCALES.length <= 1 && user.locale}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('users.loginCount')}</TableCell>
              <TableCell>{user.loginCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('users.status')}</TableCell>
              <TableCell>
                {isSelf && <EntityStatusLabel isEnabled={user.isActive} />}
                {!isSelf && (
                  <Switch
                    checked={isActive}
                    onClick={() => setIsActive(!isActive)}
                  />
                )}
              </TableCell>
            </TableRow>
            {!user.socialAccountId && enableAccountLock && (
              <TableRow>
                <TableCell>{t('users.lockedIPs')}</TableCell>
                <TableCell>
                  <div className='flex max-md:flex-col gap-2'>
                    <div className='flex items-center gap-6'>
                      {lockedIPs?.map((ip) => (
                        <Badge
                          data-testid='lockedIpBadge'
                          variant='secondary'
                          key={ip}>{ip || t('users.noIP')}
                        </Badge>
                      ))}
                    </div>
                    <div className='md:hidden'>
                      {renderIpButtons(lockedIPs)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='max-md:hidden'>
                  {renderIpButtons(lockedIPs)}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>{t('users.roles')}</TableCell>
              <TableCell>
                <div className='flex items-center flex-wrap gap-6 max-md:flex-col max-md:items-start'>
                  {roles?.map((role) => (
                    <div
                      key={role.id}
                      className='flex items-center gap-2'>
                      <Checkbox
                        id={`role-${role.id}`}
                        data-testid='roleInput'
                        onClick={() => handleToggleUserRole(role.name)}
                        checked={userRoles?.includes(role.name) ?? false}
                      />
                      <Label
                        htmlFor={`role-${role.id}`}
                        className='flex'
                      >
                        {role.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
            {configs.ENABLE_ORG && (
              <TableRow>
                <TableCell>{t('users.org')}</TableCell>
                <TableCell>
                  {user.org?.name ?? ''}
                </TableCell>
              </TableRow>
            )}
            {configs.ENABLE_NAMES && (
              <>
                <TableRow>
                  <TableCell>{t('users.firstName')}</TableCell>
                  <TableCell>
                    <Input
                      data-testid='firstNameInput'
                      onChange={(e) => setFirstName(e.target.value)}
                      value={firstName ?? ''}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('users.lastName')}</TableCell>
                  <TableCell>
                    <Input
                      data-testid='lastNameInput'
                      onChange={(e) => setLastName(e.target.value)}
                      value={lastName ?? ''}
                    />
                  </TableCell>
                </TableRow>
              </>
            )}
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{user.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{user.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
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
                <CardHeader>
                  <CardTitle>{consented.appName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DeleteButton
                    onConfirmDelete={() => handleDeleteConsent(consented.appId)}
                    size='sm'
                    buttonText={t('users.revokeConsent')}
                    confirmDeleteTitle={t(
                      'users.confirmRevoke',
                      { item: consented.appName },
                    )}
                  />
                </CardContent>
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

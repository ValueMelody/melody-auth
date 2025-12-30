'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@melody-auth/react'
import {
  EditIcon, TrashIcon,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import useEditOrg from 'app/[lang]/orgs/useEditOrg'
import {
  accessTool, routeTool,
} from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import DeleteButton from 'components/DeleteButton'
import { useRouter } from 'i18n/navigation'
import {
  useGetApiV1OrgsByIdQuery, usePutApiV1OrgsByIdMutation, useDeleteApiV1OrgsByIdMutation,
  useGetApiV1OrgGroupsQuery, useDeleteApiV1OrgGroupsByIdMutation, useGetApiV1OrgGroupsByIdUsersQuery,
  usePostApiV1OrgsByIdVerifyDomainMutation,
} from 'services/auth/api'
import ColorInput from 'components/ColorInput'
import LinkInput from 'components/LinkInput'
import UserTable from 'components/UserTable'
import Breadcrumb from 'components/Breadcrumb'
import PageTitle from 'components/PageTitle'
import LoadingPage from 'components/LoadingPage'
import { Switch } from 'components/ui/switch'
import RequiredProperty from 'components/RequiredProperty'
import { Button } from 'components/ui/button'
import CreateOrgGroupModal from '@/app/[lang]/orgs/[id]/CreateOrgGroupModal'
import UpdateOrgGroupModal from '@/app/[lang]/orgs/[id]/UpdateOrgGroupModal'
import { Badge } from '@/components/ui/badge'
import ConfirmModal from '@/components/ConfirmModal'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useRouter()

  const configs = useSignalValue(configSignal)
  const enableOrgGroup = configs?.ENABLE_ORG_GROUP

  const [isViewingAllUsers, setIsViewingAllUsers] = useState(false)

  const {
    data, isLoading,
  } = useGetApiV1OrgsByIdQuery({ id: Number(id) })
  const [updateOrg, { isLoading: isUpdating }] = usePutApiV1OrgsByIdMutation()
  const [deleteOrg, { isLoading: isDeleting }] = useDeleteApiV1OrgsByIdMutation()
  const [verifyDomain, { isLoading: isVerifying }] = usePostApiV1OrgsByIdVerifyDomainMutation()

  const [isCreatingOrgGroup, setIsCreatingOrgGroup] = useState(false)
  const [updatingOrgGroupId, setUpdatingOrgGroupId] = useState<number | null>(null)
  const [deletingOrgGroupId, setDeletingOrgGroupId] = useState<number | null>(null)
  const [selectedOrgGroupId, setSelectedOrgGroupId] = useState<number | null>(null)

  const { data: orgGroupUsersData } = useGetApiV1OrgGroupsByIdUsersQuery(
    { id: selectedOrgGroupId ?? 0 },
    { skip: !selectedOrgGroupId || isViewingAllUsers },
  )

  const orgGroupUsers = selectedOrgGroupId ? (orgGroupUsersData?.users ?? []) : null

  const { data: orgGroups } = useGetApiV1OrgGroupsQuery(
    { orgId: Number(id) },
    { skip: !enableOrgGroup },
  )

  const [deleteOrgGroup] = useDeleteApiV1OrgGroupsByIdMutation()

  const org = data?.org

  const { userInfo } = useAuth()
  const canWriteOrg = accessTool.isAllowedAccess(
    accessTool.Access.WriteOrg,
    userInfo?.roles,
  )
  const canReadUser = accessTool.isAllowedAccess(
    accessTool.Access.ReadUser,
    userInfo?.roles,
  )

  const {
    values, errors, onChange,
  } = useEditOrg(org)
  const [showErrors, setShowErrors] = useState(false)

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    await updateOrg({
      id: Number(id),
      putOrgReq: values,
    })
  }

  const handleDelete = async () => {
    await deleteOrg({ id: Number(id) })

    router.push(routeTool.Internal.Orgs)
  }

  const handleVerifyDomain = async () => {
    await verifyDomain({ id: Number(id) })
  }

  const switchUserView = () => {
    setIsViewingAllUsers(!isViewingAllUsers)
  }

  const handleDeleteOrgGroup = async () => {
    if (deletingOrgGroupId) {
      await deleteOrgGroup({ id: deletingOrgGroupId })
    }

    setDeletingOrgGroupId(null)
  }

  if (isLoading) return <LoadingPage />

  if (!org) return null

  return (
    <section>
      <Breadcrumb
        page={{ label: org.name }}
        parent={{
          href: routeTool.Internal.Orgs,
          label: t('orgs.title'),
        }}
      />
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='max-md:w-24 md:w-48'>{t('common.property')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y'>
            <TableRow>
              <TableCell>
                <RequiredProperty title={t('orgs.name')} />
              </TableCell>
              <TableCell>
                <Input
                  data-testid='nameInput'
                  disabled={!canWriteOrg}
                  onChange={(e) => onChange(
                    'name',
                    e.target.value,
                  )}
                  value={values.name}
                />
                {showErrors && <FieldError error={errors.name} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <RequiredProperty title={t('orgs.slug')} />
              </TableCell>
              <TableCell>
                <Input
                  data-testid='slugInput'
                  disabled={!canWriteOrg}
                  onChange={(e) => onChange(
                    'slug',
                    e.target.value,
                  )}
                  value={values.slug}
                />
                {showErrors && <FieldError error={errors.slug} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('orgs.allowPublicRegistration')}</TableCell>
              <TableCell>
                <Switch
                  disabled={!canWriteOrg}
                  checked={values.allowPublicRegistration}
                  onClick={() => onChange(
                    'allowPublicRegistration',
                    !values.allowPublicRegistration,
                  )}
                />
              </TableCell>
            </TableRow>
            {!!values.allowPublicRegistration && (
              <>
                <TableRow>
                  <TableCell>{t('orgs.onlyUseForBrandingOverride')}</TableCell>
                  <TableCell>
                    <Switch
                      disabled={!canWriteOrg}
                      checked={values.onlyUseForBrandingOverride}
                      onClick={() => onChange(
                        'onlyUseForBrandingOverride',
                        !values.onlyUseForBrandingOverride,
                      )}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.companyLogoUrl')}</TableCell>
                  <TableCell>
                    <LinkInput
                      data-testid='companyLogoUrlInput'
                      disabled={!canWriteOrg}
                      onChange={(value) => onChange(
                        'companyLogoUrl',
                        value,
                      )}
                      value={values.companyLogoUrl}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.companyEmailLogoUrl')}</TableCell>
                  <TableCell>
                    <LinkInput
                      data-testid='companyEmailLogoUrlInput'
                      disabled={!canWriteOrg}
                      onChange={(value) => onChange(
                        'companyEmailLogoUrl',
                        value,
                      )}
                      value={values.companyEmailLogoUrl}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.fontFamily')}</TableCell>
                  <TableCell>
                    <Input
                      disabled={!canWriteOrg}
                      data-testid='fontFamilyInput'
                      onChange={(e) => onChange(
                        'fontFamily',
                        e.target.value,
                      )}
                      value={values.fontFamily}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.fontUrl')}</TableCell>
                  <TableCell>
                    <LinkInput
                      disabled={!canWriteOrg}
                      data-testid='fontUrlInput'
                      onChange={(value) => onChange(
                        'fontUrl',
                        value,
                      )}
                      value={values.fontUrl}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.layoutColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='layoutColorInput'
                      onChange={(value) => onChange(
                        'layoutColor',
                        value,
                      )}
                      value={values.layoutColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.labelColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='labelColorInput'
                      onChange={(value) => onChange(
                        'labelColor',
                        value,
                      )}
                      value={values.labelColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.primaryButtonColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='primaryButtonColorInput'
                      onChange={(value) => onChange(
                        'primaryButtonColor',
                        value,
                      )}
                      value={values.primaryButtonColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.primaryButtonLabelColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='primaryButtonLabelColorInput'
                      onChange={(value) => onChange(
                        'primaryButtonLabelColor',
                        value,
                      )}
                      value={values.primaryButtonLabelColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.primaryButtonBorderColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='primaryButtonBorderColorInput'
                      onChange={(value) => onChange(
                        'primaryButtonBorderColor',
                        value,
                      )}
                      value={values.primaryButtonBorderColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.secondaryButtonColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='secondaryButtonColorInput'
                      onChange={(value) => onChange(
                        'secondaryButtonColor',
                        value,
                      )}
                      value={values.secondaryButtonColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.secondaryButtonLabelColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='secondaryButtonLabelColorInput'
                      onChange={(value) => onChange(
                        'secondaryButtonLabelColor',
                        value,
                      )}
                      value={values.secondaryButtonLabelColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.secondaryButtonBorderColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='secondaryButtonBorderColorInput'
                      onChange={(value) => onChange(
                        'secondaryButtonBorderColor',
                        value,
                      )}
                      value={values.secondaryButtonBorderColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.criticalIndicatorColor')}</TableCell>
                  <TableCell>
                    <ColorInput
                      disabled={!canWriteOrg}
                      data-testid='criticalIndicatorColorInput'
                      onChange={(value) => onChange(
                        'criticalIndicatorColor',
                        value,
                      )}
                      value={values.criticalIndicatorColor}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.termsLink')}</TableCell>
                  <TableCell>
                    <LinkInput
                      data-testid='termsLinkInput'
                      disabled={!canWriteOrg}
                      onChange={(value) => onChange(
                        'termsLink',
                        value,
                      )}
                      value={values.termsLink}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.privacyPolicyLink')}</TableCell>
                  <TableCell>
                    <LinkInput
                      data-testid='privacyPolicyLinkInput'
                      disabled={!canWriteOrg}
                      onChange={(value) => onChange(
                        'privacyPolicyLink',
                        value,
                      )}
                      value={values.privacyPolicyLink}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('orgs.customDomain')}</TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        <Input
                          data-testid='customDomainInput'
                          disabled={!canWriteOrg}
                          placeholder='auth.example.com'
                          onChange={(e) => onChange(
                            'customDomain',
                            e.target.value,
                          )}
                          value={values.customDomain}
                        />
                        {org.customDomain && (
                          <Badge variant={org.customDomainVerified ? 'default' : 'secondary'}>
                            {org.customDomainVerified ? t('orgs.customDomainVerified') : t('orgs.customDomainNotVerified')}
                          </Badge>
                        )}
                      </div>
                      {org.customDomain && !org.customDomainVerified && org.customDomainVerificationToken && (
                        <div className='text-sm text-gray-500 space-y-2 p-3 bg-gray-50 rounded'>
                          <p>{t('orgs.customDomainHelp')}</p>
                          <div>
                            <p className='font-medium'>{t('orgs.dnsRecordName')}:</p>
                            <code className='text-xs bg-gray-100 p-1 rounded'>_goauth-verify.{org.customDomain}</code>
                          </div>
                          <div>
                            <p className='font-medium'>{t('orgs.dnsRecordValue')}:</p>
                            <code className='text-xs bg-gray-100 p-1 rounded'>goauth-verify={org.customDomainVerificationToken}</code>
                          </div>
                          {canWriteOrg && (
                            <Button
                              size='sm'
                              variant='outline'
                              disabled={isVerifying}
                              onClick={handleVerifyDomain}
                            >
                              {isVerifying ? t('orgs.verifying') : t('orgs.verifyDomain')}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </>
            )}
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{org.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{org.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
      <SubmitError />
      {canWriteOrg && (
        <section className='flex items-center gap-4 mt-8'>
          <SaveButton
            isLoading={isUpdating}
            disabled={!values.name}
            onClick={handleSave}
          />
          <DeleteButton
            isLoading={isDeleting}
            disabled={isUpdating}
            confirmDeleteTitle={t(
              'common.deleteConfirm',
              { item: values.name },
            )}
            onConfirmDelete={handleDelete}
          />
        </section>
      )}
      {canReadUser && (
        <section className='mt-12'>
          <div className='flex items-center gap-4 mb-6'>
            <PageTitle
              title={isViewingAllUsers ? t('orgs.allUsers') : t('orgs.users')}
            />
            <Button
              variant='outline'
              size='sm'
              onClick={switchUserView}>
              {isViewingAllUsers ? t('orgs.viewActiveUsers') : t('orgs.viewAllUsers')}
            </Button>
          </div>
          <CreateOrgGroupModal
            show={isCreatingOrgGroup}
            orgId={Number(id)}
            onClose={() => setIsCreatingOrgGroup(false)}
          />
          <UpdateOrgGroupModal
            id={updatingOrgGroupId ?? 0}
            show={!!updatingOrgGroupId}
            initialName={orgGroups?.orgGroups?.find((orgGroup) => orgGroup.id === updatingOrgGroupId)?.name ?? ''}
            onClose={() => setUpdatingOrgGroupId(null)}
          />
          <ConfirmModal
            show={!!deletingOrgGroupId}
            title={t(
              'common.deleteConfirm',
              { item: orgGroups?.orgGroups?.find((orgGroup) => orgGroup.id === deletingOrgGroupId)?.name ?? '' },
            )}
            onClose={() => setDeletingOrgGroupId(null)}
            onConfirm={handleDeleteOrgGroup}
            confirmButtonText={t('common.delete')}
          />
          {enableOrgGroup && !isViewingAllUsers && (
            <section className='mb-6 flex justify-between'>
              <section className='flex gap-4 items-center'>
                <p className='text-sm text-gray-500'>
                  {orgGroups?.orgGroups?.length ? t('orgGroups.groups') : t('orgGroups.noGroups')}
                </p>
                {orgGroups?.orgGroups?.map((orgGroup) => (
                  <Badge
                    key={orgGroup.id}
                    variant={selectedOrgGroupId === orgGroup.id ? 'default' : 'secondary'}
                    onClick={() => setSelectedOrgGroupId(selectedOrgGroupId === orgGroup.id ? null : orgGroup.id)}
                    className='cursor-pointer gap-4'
                  >
                    {orgGroup.name}
                    {canWriteOrg && (
                      <div className='flex gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='p-1'
                          onClick={() => setUpdatingOrgGroupId(orgGroup.id)}
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='p-1'
                          onClick={() => setDeletingOrgGroupId(orgGroup.id)}
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    )}
                  </Badge>
                ))}
              </section>
              {canWriteOrg && (
                <Button
                  onClick={() => setIsCreatingOrgGroup(true)}
                  size='sm'
                  variant='outline'
                >
                  {t('orgGroups.new')}
                </Button>
              )}
            </section>
          )}
          <UserTable
            orgId={Number(id)}
            loadedUsers={orgGroupUsers}
            isViewingAllUsers={isViewingAllUsers}
          />
        </section>
      )}
    </section>
  )
}

export default Page

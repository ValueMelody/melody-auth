import { useTranslations } from 'next-intl'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel,
  AlertDialogDescription,
} from 'components/ui/alert-dialog'
import {
  useGetApiV1OrgsQuery,
  useGetApiV1UsersByAuthIdOrgsQuery,
  usePostApiV1UsersByAuthIdOrgsMutation,
} from 'services/auth/api'
import SubmitError from 'components/SubmitError'

import { Checkbox } from 'components/ui/checkbox'
import { Label } from 'components/ui/label'

const UserOrgGroupModal = ({
  authId,
  show,
  onClose,
}: {
  authId: string;
  show: boolean;
  onClose: () => void;
}) => {
  const t = useTranslations()

  const { data: orgsData } = useGetApiV1OrgsQuery()
  const orgs = orgsData?.orgs?.filter((org) => !org.onlyUseForBrandingOverride) ?? []

  const {
    data: userOrgsData, isLoading: isLoadingUserOrgs,
  } = useGetApiV1UsersByAuthIdOrgsQuery({ authId: String(authId) })
  const userOrgs = userOrgsData?.orgs ?? []
  const userOrgIds = userOrgs.map((org) => org.id)

  const [postUserOrgs, { isLoading }] =
    usePostApiV1UsersByAuthIdOrgsMutation()

  const handleToggleOrg = (orgIds: number) => {
    const newOrgIds = userOrgIds.includes(orgIds) ? userOrgIds.filter((id) => id !== orgIds) : [...userOrgIds, orgIds]
    postUserOrgs({
      authId,
      body: { orgs: newOrgIds },
    })
  }

  return (
    <AlertDialog open={show}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('users.manageUserAllOrgs')}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>{t('users.selectUserOrgs')}</AlertDialogDescription>
        <section className='flex max-md:flex-col gap-6 max-md:gap-2 flex-wrap'>
          {orgs.map((org) => (
            <div
              key={org.id}
              className='flex items-center gap-2'>
              <Checkbox
                data-testid='orgInput'
                id={`org-${org.id}`}
                onClick={() => handleToggleOrg(org.id)}
                checked={userOrgIds.includes(org.id)}
                disabled={isLoading || isLoadingUserOrgs}
              />
              <Label
                htmlFor={`org-${org.id}`}
                className='flex'
              >
                {org.name}
              </Label>
            </div>
          ))}
        </section>
        <SubmitError />
        <AlertDialogFooter className='flex gap-2'>
          <AlertDialogCancel onClick={onClose}>
            {t('common.close')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default UserOrgGroupModal

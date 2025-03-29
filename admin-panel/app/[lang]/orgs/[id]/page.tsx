'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState } from 'react'
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
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import {
  useGetApiV1OrgsByIdQuery, usePutApiV1OrgsByIdMutation, useDeleteApiV1OrgsByIdMutation,
} from 'services/auth/api'
import ColorInput from 'components/ColorInput'
import LinkInput from 'components/LinkInput'
import UserTable from 'components/UserTable'
import Breadcrumb from 'components/Breadcrumb'
import PageTitle from 'components/PageTitle'
import LoadingPage from 'components/LoadingPage'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useLocaleRouter()

  const {
    data, isLoading,
  } = useGetApiV1OrgsByIdQuery({ id: Number(id) })
  const [updateOrg, { isLoading: isUpdating }] = usePutApiV1OrgsByIdMutation()
  const [deleteOrg, { isLoading: isDeleting }] = useDeleteApiV1OrgsByIdMutation()

  const org = data?.org

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
    const res = await deleteOrg({ id: Number(id) })

    if (res.error) {
      setShowErrors(true)
      return
    }

    router.push(routeTool.Internal.Orgs)
  }

  if (isLoading) return <LoadingPage />

  if (!org) return null

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('orgs.org') }}
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
              <TableCell>{t('orgs.name')}</TableCell>
              <TableCell>
                <Input
                  data-testid='nameInput'
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
              <TableCell>{t('orgs.slug')}</TableCell>
              <TableCell>
                <Input
                  data-testid='slugInput'
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
              <TableCell>{t('orgs.companyLogoUrl')}</TableCell>
              <TableCell>
                <LinkInput
                  data-testid='companyLogoUrlInput'
                  onChange={(value) => onChange(
                    'companyLogoUrl',
                    value,
                  )}
                  value={values.companyLogoUrl}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('orgs.fontFamily')}</TableCell>
              <TableCell>
                <Input
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
                  onChange={(value) => onChange(
                    'privacyPolicyLink',
                    value,
                  )}
                  value={values.privacyPolicyLink}
                />
              </TableCell>
            </TableRow>
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
      <section className='mt-12'>
        <PageTitle
          className='mb-6'
          title={t('orgs.users')}
        />
        <UserTable
          orgId={Number(id)}
        />
      </section>
    </section>
  )
}

export default Page

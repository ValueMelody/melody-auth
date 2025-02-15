'use client'

import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import useEditOrg from 'app/[lang]/orgs/useEditOrg'
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import PageTitle from 'components/PageTitle'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import {
  useGetApiV1OrgsByIdQuery, usePutApiV1OrgsByIdMutation, useDeleteApiV1OrgsByIdMutation,
} from 'services/auth/api'
import ColorInput from 'components/ColorInput'
import LinkInput from 'components/LinkInput'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useLocaleRouter()

  const { data } = useGetApiV1OrgsByIdQuery({ id: Number(id) })
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
    await deleteOrg({ id: Number(id) })

    router.push(routeTool.Internal.Orgs)
  }

  if (!org) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('orgs.org')}
      />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell className='max-md:w-24 md:w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('orgs.name')}</Table.Cell>
              <Table.Cell>
                <TextInput
                  data-testid='nameInput'
                  onChange={(e) => onChange(
                    'name',
                    e.target.value,
                  )}
                  value={values.name} />
                {showErrors && <FieldError error={errors.name} />}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.slug')}</Table.Cell>
              <Table.Cell>
                <TextInput
                  data-testid='slugInput'
                  onChange={(e) => onChange(
                    'slug',
                    e.target.value,
                  )}
                  value={values.slug} />
                {showErrors && <FieldError error={errors.slug} />}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.companyLogoUrl')}</Table.Cell>
              <Table.Cell>
                <LinkInput
                  data-testid='companyLogoUrlInput'
                  onChange={(value) => onChange(
                    'companyLogoUrl',
                    value,
                  )}
                  value={values.companyLogoUrl}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.fontFamily')}</Table.Cell>
              <Table.Cell>
                <TextInput
                  data-testid='fontFamilyInput'
                  onChange={(e) => onChange(
                    'fontFamily',
                    e.target.value,
                  )}
                  value={values.fontFamily}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.fontUrl')}</Table.Cell>
              <Table.Cell>
                <LinkInput
                  data-testid='fontUrlInput'
                  onChange={(value) => onChange(
                    'fontUrl',
                    value,
                  )}
                  value={values.fontUrl}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.layoutColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='layoutColorInput'
                  onChange={(value) => onChange(
                    'layoutColor',
                    value,
                  )}
                  value={values.layoutColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.labelColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='labelColorInput'
                  onChange={(value) => onChange(
                    'labelColor',
                    value,
                  )}
                  value={values.labelColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.primaryButtonColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='primaryButtonColorInput'
                  onChange={(value) => onChange(
                    'primaryButtonColor',
                    value,
                  )}
                  value={values.primaryButtonColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.primaryButtonLabelColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='primaryButtonLabelColorInput'
                  onChange={(value) => onChange(
                    'primaryButtonLabelColor',
                    value,
                  )}
                  value={values.primaryButtonLabelColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.primaryButtonBorderColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='primaryButtonBorderColorInput'
                  onChange={(value) => onChange(
                    'primaryButtonBorderColor',
                    value,
                  )}
                  value={values.primaryButtonBorderColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.secondaryButtonColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='secondaryButtonColorInput'
                  onChange={(value) => onChange(
                    'secondaryButtonColor',
                    value,
                  )}
                  value={values.secondaryButtonColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.secondaryButtonLabelColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='secondaryButtonLabelColorInput'
                  onChange={(value) => onChange(
                    'secondaryButtonLabelColor',
                    value,
                  )}
                  value={values.secondaryButtonLabelColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.secondaryButtonBorderColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='secondaryButtonBorderColorInput'
                  onChange={(value) => onChange(
                    'secondaryButtonBorderColor',
                    value,
                  )}
                  value={values.secondaryButtonBorderColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.criticalIndicatorColor')}</Table.Cell>
              <Table.Cell>
                <ColorInput
                  data-testid='criticalIndicatorColorInput'
                  onChange={(value) => onChange(
                    'criticalIndicatorColor',
                    value,
                  )}
                  value={values.criticalIndicatorColor}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.termsLink')}</Table.Cell>
              <Table.Cell>
                <LinkInput
                  data-testid='termsLinkInput'
                  onChange={(value) => onChange(
                    'termsLink',
                    value,
                  )}
                  value={values.termsLink}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('orgs.privacyPolicyLink')}</Table.Cell>
              <Table.Cell>
                <LinkInput
                  data-testid='privacyPolicyLinkInput'
                  onChange={(value) => onChange(
                    'privacyPolicyLink',
                    value,
                  )}
                  value={values.privacyPolicyLink}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{org.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{org.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
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
    </section>
  )
}

export default Page

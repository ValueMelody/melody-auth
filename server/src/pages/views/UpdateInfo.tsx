import {
  localeConfig, typeConfig,
} from 'configs'
import {
  Field,
  PrimaryButton,
  SubmitError,
  SuccessMessage,
  ViewTitle,
} from 'pages/components'
import {
  useUpdateInfoForm, View,
  useSubmitError,
} from 'pages/hooks'

export interface UpdateInfoProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const UpdateInfo = ({
  locale,
  onSwitchView,
}: UpdateInfoProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    success,
    redirectUri,
  } = useUpdateInfoForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={localeConfig.updateInfo.success[locale]}
          />
        </section>
      )}
      <ViewTitle title={localeConfig.updateInfo.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-2'>
          <Field
            label={localeConfig.updateInfo.firstName[locale]}
            type='text'
            required
            value={values.firstName}
            name='firstName'
            error={errors.firstName}
            onChange={(value) => handleChange(
              'firstName',
              value,
            )}
          />
          <Field
            label={localeConfig.updateInfo.lastName[locale]}
            type='text'
            required
            value={values.lastName}
            name='lastName'
            error={errors.lastName}
            onChange={(value) => handleChange(
              'lastName',
              value,
            )}
          />
          <SubmitError error={submitError} />
          <PrimaryButton
            className='mt-4'
            type='submit'
            title={localeConfig.updateInfo.confirm[locale]}
          />
        </section>
      </form>
      <a
        class='button-secondary mt-6'
        href={redirectUri}
      >
        {localeConfig.updateInfo.redirect[locale]}
      </a>
    </>
  )
}

export default UpdateInfo

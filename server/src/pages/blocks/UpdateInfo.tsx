import { typeConfig } from 'configs'
import {
  Field, PrimaryButton, SubmitError, SuccessMessage, ViewTitle,
} from 'pages/components'
import { updateInfo } from 'pages/tools/locale'

export interface UpdateInfoProps {
  success: boolean;
  locale: typeConfig.Locale;
  handleSubmit: (e: Event) => void;
  handleChange: (name: 'firstName' | 'lastName', value: string) => void;
  values: { firstName: string; lastName: string };
  errors: { firstName: string | undefined; lastName: string | undefined };
  submitError: string | null;
  redirectUri: string;
}

const UpdateInfo = ({
  success,
  locale,
  handleSubmit,
  handleChange,
  values,
  errors,
  submitError,
  redirectUri,
}: UpdateInfoProps) => {
  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={updateInfo.success[locale]}
          />
        </section>
      )}
      <ViewTitle title={updateInfo.title[locale]} />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-2'>
          <Field
            label={updateInfo.firstName[locale]}
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
            label={updateInfo.lastName[locale]}
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
            title={updateInfo.confirm[locale]}
          />
        </section>
      </form>
      <a
        class='button-secondary mt-6'
        href={redirectUri}
      >
        {updateInfo.redirect[locale]}
      </a>
    </>
  )
}

export default UpdateInfo

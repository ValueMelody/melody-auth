import { typeConfig } from 'configs'
import {
  useUpdateInfoForm, View,
  useSubmitError,
} from 'pages/hooks'
import { UpdateInfo as UpdateInfoBlock } from 'pages/blocks'

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
    <UpdateInfoBlock
      success={success}
      locale={locale}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      values={values}
      errors={errors}
      submitError={submitError}
      redirectUri={redirectUri}
    />
  )
}

export default UpdateInfo

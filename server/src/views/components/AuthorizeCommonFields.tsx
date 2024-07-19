import { localeConfig } from 'configs'
import RequiredSymbol from 'views/components/RequiredSymbol'
import FieldError from 'views/components/FieldError'

const AuthorizeCommonFields = () => {
  return (
    <>
      <section class='flex-col gap-2'>
        <label
          class='label'
          for='email'
        >
          {localeConfig.AuthorizePasswordPage.EmailLabel}
          <RequiredSymbol />
        </label>
        <input
          class='input'
          type='email'
          id='form-email'
          name='email'
          autocomplete='email'
        />
        <FieldError id='email-error' />
      </section>
      <section class='flex-col gap-2'>
        <label
          class='label'
          for='password'
        >
          {localeConfig.AuthorizePasswordPage.PasswordLabel}
          <RequiredSymbol />
        </label>
        <input
          class='input'
          type='password'
          id='form-password'
          name='password'
          autocomplete='current-password'
        />
        <FieldError id='password-error' />
      </section>
    </>
  )
}

export default AuthorizeCommonFields

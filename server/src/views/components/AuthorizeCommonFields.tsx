import { localeConfig } from 'configs'
import { oauthDto } from 'dtos'
import RequiredSymbol from 'views/components/RequiredSymbol'
import FieldError from 'views/components/FieldError'

const AuthorizeCommonFields = ({ queryDto }: {
  queryDto: oauthDto.GetAuthorizeReqQueryDto;
}) => {
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
      <input
        type='hidden'
        id='form-responseType'
        name='responseType'
        value={queryDto.responseType}
      />
      <input
        type='hidden'
        id='form-clientId'
        name='clientId'
        value={queryDto.clientId}
      />
      <input
        type='hidden'
        id='form-redirectUri'
        name='redirectUri'
        value={queryDto.redirectUri}
      />
      <input
        type='hidden'
        id='form-scope'
        name='scope'
        value={queryDto.scope}
      />
      <input
        type='hidden'
        id='form-state'
        name='state'
        value={queryDto.state}
      />
      <input
        type='hidden'
        id='form-code-challenge'
        name='codeChallenge'
        value={queryDto.codeChallenge}
      />
      <input
        type='hidden'
        id='form-code-challenge-method'
        name='codeChallengeMethod'
        value={queryDto.codeChallengeMethod}
      />
    </>
  )
}

export default AuthorizeCommonFields

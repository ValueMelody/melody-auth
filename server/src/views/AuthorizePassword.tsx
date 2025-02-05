import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { oauthDto } from 'dtos'
import {
  requestScript, resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import SubmitButton from 'views/components/SubmitButton'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'
import Field from 'views/components/Field'

const getFBLocale = (locale: typeConfig.Locale) => {
  switch (locale) {
  case 'fr': return 'fr_FR'
  case 'en':
  default:
    return 'en_US'
  }
}

const AuthorizePassword = ({
  queryDto, branding, enableSignUp,
  enablePasswordReset, enablePasswordSignIn,
  queryString, locales,
  googleClientId, facebookClientId, githubClientId,
}: {
  queryDto: oauthDto.GetAuthorizeReqDto;
  branding: Branding;
  enableSignUp: boolean;
  enablePasswordReset: boolean;
  enablePasswordSignIn: boolean;
  queryString: string;
  locales: typeConfig.Locale[];
  googleClientId: string;
  facebookClientId: string;
  githubClientId: string;
}) => {
  return (
    <Layout
      locales={locales}
      branding={branding}
      locale={queryDto.locale}
    >
      {googleClientId && (
        <script
          src='https://accounts.google.com/gsi/client'
          async>
        </script>
      )}
      {facebookClientId && html`
        <script>
          window.fbAsyncInit = function() {
            FB.init({
              appId: ${facebookClientId},
              cookie: true,
              xfbml: true,
              version: 'v20.0'
            });
            FB.AppEvents.logPageView();
          };
          (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/${getFBLocale(queryDto.locale)}/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
        </script>
      `}
      <Title title={localeConfig.authorizePassword.title[queryDto.locale]} />
      <SubmitError />
      <form
        autocomplete='on'
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-2'>
          {enablePasswordSignIn && (
            <>
              <Field
                label={localeConfig.authorizePassword.email[queryDto.locale]}
                type='email'
                required
                name='email'
                autocomplete='email'
              />
              <Field
                label={localeConfig.authorizePassword.password[queryDto.locale]}
                type='password'
                required
                name='password'
                autocomplete='password'
              />
            </>
          )}
          {enablePasswordSignIn && (
            <SubmitButton
              title={localeConfig.authorizePassword.submit[queryDto.locale]}
            />
          )}
          {(googleClientId || facebookClientId || githubClientId) && (
            <section class='flex flex-col gap-4'>
              {googleClientId && (
                <>
                  <div
                    id='g_id_onload'
                    data-client_id={googleClientId}
                    data-auto_prompt='false'
                    data-callback='handleGoogleSignIn'
                  />
                  <div class='flex-row justify-center'>
                    <div
                      class='g_id_signin'
                      data-type='standard'
                      data-size='large'
                      data-width='240'
                      data-theme='outline'
                      data-text='sign_in_with'
                      data-locale={queryDto.locale}
                      data-shape='rectangular'
                      data-logo_alignment='left'
                    />
                  </div>
                </>
              )}
              {facebookClientId && (
                <div
                  id='facebook-login-btn'
                  class='flex-row justify-center'
                >
                  <fb:login-button
                    scope='public_profile'
                    data-size='Large'
                    data-width='220'
                    data-use-continue-as='false'
                    onlogin='checkLoginState();'
                  />
                </div>
              )}
              {githubClientId && (
                <div class='flex-row justify-center'>
                  <a
                    id='github-login-btn'
                    class='flex-row items-center justify-center'
                    style={{
                      width: 240,
                      height: 40,
                      backgroundColor: '#24292e',
                      padding: '0 8px',
                      gap: 8,
                      color: 'white',
                      borderRadius: 4,
                      fontSize: 14,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                    href={`https://github.com/login/oauth/authorize?client_id=${githubClientId}&state=${JSON.stringify(queryDto)}`}
                  >
                    <img
                      style={{
                        width: 20, height: 20, marginRight: 10,
                      }}
                      src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                      alt='GitHub logo' />
                    {localeConfig.authorizePassword.githubSignIn[queryDto.locale]}
                  </a>
                </div>
              )}
            </section>
          )}
        </section>
      </form>
      {(enableSignUp || enablePasswordReset) && (
        <section class='flex-col gap-4'>
          {enableSignUp && (
            <a
              class='button-secondary'
              href={`${routeConfig.IdentityRoute.AuthorizeAccount}?${queryString}`}
            >
              {localeConfig.authorizePassword.signUp[queryDto.locale]}
            </a>
          )}
          {enablePasswordReset && (
            <a
              class='button-secondary'
              href={`${routeConfig.IdentityRoute.AuthorizeReset}?${queryString}`}
            >
              {localeConfig.authorizePassword.passwordReset[queryDto.locale]}
            </a>
          )}
        </section>
      )}
      {facebookClientId && html`
        <script>
          function faceBookStatusChangeCallback (response) {
            if (!response || !response.authResponse || !response.authResponse.accessToken) return false
            fetch('${routeConfig.IdentityRoute.AuthorizeFacebook}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                credential: response.authResponse.accessToken,
                ${requestScript.parseAuthorizeBaseValues(queryDto)}
              })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              ${responseScript.handleAuthorizeFormRedirect(
      queryDto.locale, queryDto.org,
    )}
            })
            .catch((error) => {
              ${responseScript.handleSubmitError(queryDto.locale)}
            });
          }
          function checkLoginState() {
            FB.getLoginStatus(function(response) {
              faceBookStatusChangeCallback(response);
            });
          }
        </script>
      `}
      {googleClientId && html`
        <script>
          function handleGoogleSignIn (response) {
            if (!response.credential) return false;
            fetch('${routeConfig.IdentityRoute.AuthorizeGoogle}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                credential: response.credential,
                ${requestScript.parseAuthorizeBaseValues(queryDto)}
              })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              ${responseScript.handleAuthorizeFormRedirect(
      queryDto.locale,
      queryDto.org,
    )}
            })
            .catch((error) => {
              ${responseScript.handleSubmitError(queryDto.locale)}
            });
          }
        </script>
      `}
      {html`
        <script>
          ${resetErrorScript.resetEmailError()}
          ${resetErrorScript.resetPasswordError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.email(queryDto.locale)}
            ${validateScript.password(queryDto.locale)}
            fetch('${routeConfig.IdentityRoute.AuthorizePassword}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: document.getElementById('form-email').value,
                password: document.getElementById('form-password').value,
                ${requestScript.parseAuthorizeBaseValues(queryDto)}
              })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              ${responseScript.handleAuthorizeFormRedirect(
      queryDto.locale,
      queryDto.org,
    )}
            })
            .catch((error) => {
              ${responseScript.handleSubmitError(queryDto.locale)}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizePassword

import { html } from 'hono/html'
import { localeConfig } from 'configs'

export const resetError = () => html`
  window.addEventListener('load', function () {
    document.getElementById('form-email').addEventListener('input', function () {
      document.getElementById('email-error').classList.add('hidden');
    });
    document.getElementById('form-password').addEventListener('input', function () {
      document.getElementById('password-error').classList.add('hidden');
    });
    var confirmPasswordEl = document.getElementById('form-confirmPassword')
    if (confirmPasswordEl) {
      confirmPasswordEl.addEventListener('input', function () {
        document.getElementById('confirmPassword-error').classList.add('hidden');
      });
    }
    var firstNameEl = document.getElementById('form-firstName')
    if (firstNameEl) {
      firstNameEl.addEventListener('input', function () {
        document.getElementById('firstName-error').classList.add('hidden');
      });
    }
    var lastNameEl = document.getElementById('form-lastName')
    if (lastNameEl) {
      lastNameEl.addEventListener('input', function () {
        document.getElementById('lastName-error').classList.add('hidden');
      });
    }
  });
`

export const parseResponse = () => html`
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(text);
    });
  }
  return response.json();
`

export const parseCommonFormFields = () => html`
  email: document.getElementById('form-email').value,
  password: document.getElementById('form-password').value,
  clientId: document.getElementById('form-clientId').value,
  redirectUri: document.getElementById('form-redirectUri').value,
  responseType: document.getElementById('form-responseType').value,
  state: document.getElementById('form-state').value,
  codeChallenge: document.getElementById('form-code-challenge').value,
  codeChallengeMethod: document.getElementById('form-code-challenge-method').value,
  scopes: document.getElementById('form-scopes').value.split(','),
`

export const handleError = () => html`
  var msg = "${localeConfig.Message.AuthFailed}";
  var errorString = String(error)
  console.error(msg + ": " + error)
  if (errorString.indexOf("isEmail") !== -1) {
    msg = "${localeConfig.Message.WrongEmailFormat}";
  } else if (errorString.indexOf("isStrongPassword") !== -1) {
    msg = "${localeConfig.Message.WeakPassword}";
  } else if (errorString.indexOf("${localeConfig.Error.NoUser}") !== -1) {
    msg = "${localeConfig.Error.NoUser}";
  } else if (errorString.indexOf("${localeConfig.Error.EmailTaken}") !== -1) {
    msg = "${localeConfig.Error.EmailTaken}";
  } else if (errorString.indexOf("constraints") !== -1) {
    var constraints = JSON.parse(error.message)[0].constraints
    msg = Object.values(constraints).join('.');
  }
  var errorEl = document.getElementById('submit-error');
  errorEl.classList.remove('hidden');
  errorEl.innerHTML = msg;
  return false;
`

export const handleRedirect = () => html`
  var queryString = "?state=" + data.state + "&code=" + data.code;
  if (data.requireConsent) {
    queryString += "&redirect_uri=" + data.redirectUri;
    var url = "/oauth2/authorize-consent" + queryString
    window.location.href = url;
  } else {
    var url = data.redirectUri + queryString;
    window.location.href = url;
  }
  return true
`

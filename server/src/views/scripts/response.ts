import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
} from 'configs'

export const parseRes = () => html`
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(text);
    });
  }
  return response.json();
`

export const handleAuthorizeFormRedirect = () => html`
  var queryString = "?state=" + data.state + "&code=" + data.code;
  if (data.requireConsent) {
    queryString += "&redirect_uri=" + data.redirectUri;
    var url = "${routeConfig.InternalRoute.Identity}/authorize-consent" + queryString
    window.location.href = url;
  } else if (data.requireEmailMFA) {
    queryString += "&redirect_uri=" + data.redirectUri;
    var url = "${routeConfig.InternalRoute.Identity}/authorize-email-mfa" + queryString
    window.location.href = url;
  } else {
    var url = data.redirectUri + queryString;
    window.location.href = url;
  }
  return true
`

export const handleSubmitError = () => html`
  var msg = "${localeConfig.requestError.authFailed.en}";
  var errorString = String(error)
  console.error(msg + ": " + error)
  if (errorString.indexOf("isEmail") !== -1) {
    msg = "${localeConfig.validateError.isNotEmail.en}";
  } else if (errorString.indexOf("isStrongPassword") !== -1) {
    msg = "${localeConfig.validateError.isWeakPassword.en}";
  } else if (errorString.indexOf("${localeConfig.Error.NoUser}") !== -1) {
    msg = "${localeConfig.requestError.noUser.en}";
  } else if (errorString.indexOf("${localeConfig.Error.AccountLocked}") !== -1) {
    msg = "${localeConfig.requestError.accountLocked.en}";
  } else if (errorString.indexOf("${localeConfig.Error.EmailTaken}") !== -1) {
    msg = "${localeConfig.requestError.emailTaken.en}";
  } else if (errorString.indexOf("${localeConfig.Error.WrongCode}") !== -1) {
    msg = "${localeConfig.Error.WrongCode}";
  } else if (errorString.indexOf("${localeConfig.Error.WrongMfaCode}") !== -1) {
    msg = "${localeConfig.Error.WrongCode}";
  }
  var errorEl = document.getElementById('submit-error');
  errorEl.classList.remove('hidden');
  errorEl.innerHTML = msg;
  return false;
`

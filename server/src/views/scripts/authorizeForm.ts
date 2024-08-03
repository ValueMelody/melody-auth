import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
} from 'configs'

export const handleAuthorizeFormError = () => html`
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

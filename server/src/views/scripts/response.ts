import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'

export const parseRes = () => html`
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(text);
    });
  }
  return response.json();
`

export const handleAuthorizeFormRedirect = (locale: typeConfig.Locale) => html`
  var queryString = "?state=" + data.state + "&code=" + data.code + "&locale=" + "${locale}";
  if (data.nextPage) {
    var url = data.nextPage + queryString + "&redirect_uri=" + data.redirectUri
    window.location.href = url;
  } else {
    var url = data.redirectUri + queryString;
    window.location.href = url;
  }
  return true
`

export const handleSubmitError = (locale: typeConfig.Locale) => html`
  var msg = "${localeConfig.requestError.authFailed[locale]}";
  var errorString = String(error)
  console.error(msg + ": " + error)
  if (errorString.indexOf("isEmail") !== -1) {
    msg = "${localeConfig.validateError.isNotEmail[locale]}";
  } else if (errorString.indexOf("isStrongPassword") !== -1) {
    msg = "${localeConfig.validateError.isWeakPassword[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.NoUser}") !== -1) {
    msg = "${localeConfig.requestError.noUser[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.UserDisabled}") !== -1) {
    msg = "${localeConfig.requestError.disabledUser[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.AccountLocked}") !== -1) {
    msg = "${localeConfig.requestError.accountLocked[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.OtpMfaLocked}") !== -1) {
    msg = "${localeConfig.requestError.optMfaLocked[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.SmsMfaLocked}") !== -1) {
    msg = "${localeConfig.requestError.smsMfaLocked[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.EmailMfaLocked}") !== -1) {
    msg = "${localeConfig.requestError.emailMfaLocked[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.PasswordResetLocked}") !== -1) {
    msg = "${localeConfig.requestError.passwordResetLocked[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.EmailTaken}") !== -1) {
    msg = "${localeConfig.requestError.emailTaken[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.WrongCode}") !== -1) {
    msg = "${localeConfig.requestError.wrongCode[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.RequireDifferentPassword}") !== -1) {
    msg = "${localeConfig.requestError.requireNewPassword[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.WrongMfaCode}") !== -1) {
    msg = "${localeConfig.requestError.wrongCode[locale]}";
  } else if (errorString.indexOf("${localeConfig.Error.WrongAuthCode}") !== -1) {
    window.location.href = "${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${locale}";
  }
  var errorEl = document.getElementById('submit-error');
  errorEl.classList.remove('hidden');
  errorEl.innerHTML = msg;
  var submitBtn = document.getElementById('submit-button');
  if (submitBtn) submitBtn.disabled = true;
  return false;
`

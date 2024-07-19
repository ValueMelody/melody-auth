import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
} from 'configs'

export const resetAuthorizeFormError = () => html`
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
  } else {
    var url = data.redirectUri + queryString;
    window.location.href = url;
  }
  return true
`

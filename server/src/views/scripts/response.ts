import { html } from 'hono/html'
import { localeConfig } from 'configs'

export const parseRes = () => html`
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(text);
    });
  }
  return response.json();
`

export const handleError = () => html`
  var msg = "${localeConfig.Message.AuthFailed}";
  var errorString = String(error)
  console.error(msg + ": " + error)
  if (errorString.indexOf("constraints") !== -1) {
    var constraints = JSON.parse(error.message)[0].constraints
    msg = Object.values(constraints).join('.');
  }
  var errorEl = document.getElementById('submit-error');
  errorEl.classList.remove('hidden');
  errorEl.innerHTML = msg;
  return false;
`

export const handleVerifyEmailFormError = () => html`
  var msg = "${localeConfig.Message.AuthFailed}";
  var errorString = String(error)
  console.error(msg + ": " + error)
  if (errorString.indexOf("${localeConfig.Error.WrongCode}") !== -1) {
    msg = "${localeConfig.Error.WrongCode}";
  } else if (errorString.indexOf("${localeConfig.Error.CodeExpired}") !== -1) {
    msg = "${localeConfig.Error.CodeExpired}";
  } else if (errorString.indexOf("constraints") !== -1) {
    var constraints = JSON.parse(error.message)[0].constraints
    msg = Object.values(constraints).join('.');
  }
  var errorEl = document.getElementById('submit-error');
  errorEl.classList.remove('hidden');
  errorEl.innerHTML = msg;
  return false;
`

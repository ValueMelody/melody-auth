import { html } from 'hono/html'
import { localeConfig } from 'configs'

export const verificationCode = () => html`
  var msg;
  var codeVal = document.getElementById('form-code').value.trim();
  if (codeVal.length !== 8) msg = "${localeConfig.validateError.verificationCodeLengthIssue.en}";
  if (msg) {
    var errorEl = document.getElementById('error-code');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const email = () => html`
  var msg;
  var emailVal = document.getElementById('form-email').value.trim();
  if (!emailVal) msg = "${localeConfig.validateError.emailIsRequired.en}";
  if (msg) {
    var errorEl = document.getElementById('error-email');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const firstName = () => html`
  var msg;
  var firstNameVal = document.getElementById('form-firstName').value.trim();
  if (!firstNameVal) msg = "${localeConfig.validateError.firstNameIsEmpty.en}";
  if (msg) {
    var errorEl = document.getElementById('error-firstName');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const lastName = () => html`
  var msg;
  var lastNameVal = document.getElementById('form-lastName').value.trim();
  if (!lastNameVal) msg = "${localeConfig.validateError.lastNameIsEmpty.en}";
  if (msg) {
    var errorEl = document.getElementById('error-lastName');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const password = () => html`
  var msg;
  var passwordVal = document.getElementById('form-password').value;
  if (!passwordVal) msg = "${localeConfig.validateError.passwordIsRequired.en}";
  if (msg) {
    var errorEl = document.getElementById('error-password');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const confirmPassword = () => html`
  var msg;
  var passwordVal = document.getElementById('form-password').value;
  var confirmPasswordVal = document.getElementById('form-confirmPassword').value;
  if (passwordVal !== confirmPasswordVal) msg = "${localeConfig.validateError.passwordNotMatch.en}";
  if (msg) {
    var errorEl = document.getElementById('error-confirmPassword');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

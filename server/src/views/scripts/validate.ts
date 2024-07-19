import { html } from 'hono/html'
import { localeConfig } from 'configs'

export const verificationCode = () => html`
  var msg;
  var codeVal = document.getElementById('form-code').value.trim();
  if (codeVal.length !== 8) msg = "${localeConfig.Message.VerificationCodeLength}";
  if (msg) {
    var errorEl = document.getElementById('code-error');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const email = () => html`
  var msg;
  var emailVal = document.getElementById('form-email').value.trim();
  if (!emailVal) msg = "${localeConfig.Message.EmailIsRequired}";
  if (msg) {
    var errorEl = document.getElementById('email-error');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const firstName = () => html`
  var msg;
  var firstNameVal = document.getElementById('form-firstName').value.trim();
  if (!firstNameVal) msg = "${localeConfig.Message.FirstNameIsEmpty}";
  if (msg) {
    var errorEl = document.getElementById('firstName-error');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const lastName = () => html`
  var msg;
  var lastNameVal = document.getElementById('form-lastName').value.trim();
  if (!lastNameVal) msg = "${localeConfig.Message.LastNameIsEmpty}";
  if (msg) {
    var errorEl = document.getElementById('lastName-error');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const password = () => html`
  var msg;
  var passwordVal = document.getElementById('form-password').value;
  if (!passwordVal) msg = "${localeConfig.Message.PasswordIsRequired}";
  if (msg) {
    var errorEl = document.getElementById('password-error');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const confirmPassword = () => html`
  var msg;
  var passwordVal = document.getElementById('form-password').value;
  var confirmPasswordVal = document.getElementById('form-confirmPassword').value;
  if (passwordVal !== confirmPasswordVal) msg = "${localeConfig.Message.PasswordNotMatch}";
  if (msg) {
    var errorEl = document.getElementById('confirmPassword-error');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

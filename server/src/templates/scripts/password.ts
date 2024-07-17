import { html } from 'hono/html'
import { localeConfig } from 'configs'

export const validatePassword = () => html`
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

export const validateConfirmPassword = () => html`
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

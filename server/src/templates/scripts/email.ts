import { html } from 'hono/html'
import { localeConfig } from 'configs'

export const validateEmail = () => html`
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

import { html } from 'hono/html'
import { localeConfig } from 'configs'

export const validateFirstName = () => html`
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

export const validateLastName = () => html`
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

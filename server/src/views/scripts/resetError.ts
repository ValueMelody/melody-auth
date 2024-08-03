import { html } from 'hono/html'

export const resetCodeError = () => html`
  var codeEl = document.getElementById('form-code')
  if (codeEl) {
    codeEl.addEventListener('input', function () {
      document.getElementById('code-error').classList.add('hidden');
    });
  }
`

export const resetMfaCodeError = () => html`
  var codeEl = document.getElementById('form-mfa-code')
  if (codeEl) {
    codeEl.addEventListener('input', function () {
      document.getElementById('mfa-code-error').classList.add('hidden');
    });
  }
`

export const resetEmailError = () => html`
  var emailEl = document.getElementById('form-email')
  if (emailEl) {
    emailEl.addEventListener('input', function () {
      document.getElementById('email-error').classList.add('hidden');
    });
  }
`

export const resetPasswordError = () => html`
  var passwordEl = document.getElementById('form-password')
  if (passwordEl) {
    passwordEl.addEventListener('input', function () {
      document.getElementById('password-error').classList.add('hidden');
    });
  }
`

export const resetConfirmPasswordError = () => html`
  var confirmPasswordEl = document.getElementById('form-confirmPassword')
  if (confirmPasswordEl) {
    confirmPasswordEl.addEventListener('input', function () {
      document.getElementById('confirmPassword-error').classList.add('hidden');
    });
  }
`

export const resetFirstNameError = () => html`
  var firstNameEl = document.getElementById('form-firstName')
  if (firstNameEl) {
    firstNameEl.addEventListener('input', function () {
      document.getElementById('firstName-error').classList.add('hidden');
    });
  }
`

export const resetLastNameError = () => html`
  var lastNameEl = document.getElementById('form-lastName')
  if (lastNameEl) {
    lastNameEl.addEventListener('input', function () {
      document.getElementById('lastName-error').classList.add('hidden');
    });
  }
`

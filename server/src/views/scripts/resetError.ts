import { html } from 'hono/html'

const resetSubmitError = () => html`
  var submitBtn = document.getElementById('submit-button');
  if (submitBtn) submitBtn.disabled = false;
  var errorEl = document.getElementById('submit-error');
  if (errorEl) {
    errorEl.classList.add('hidden');
    errorEl.innerHTML = '';
  }
`

export const resetCodeError = () => html`
  var codeEl = document.getElementById('form-code')
  if (codeEl) {
    codeEl.addEventListener('input', function () {
      ${resetSubmitError()}
      document.getElementById('error-code').classList.add('hidden');
    });
  }
`

export const resetPhoneNumberError = () => html`
  var phoneEl = document.getElementById('form-phoneNumber')
  if (phoneEl) {
    phoneEl.addEventListener('input', function () {
      ${resetSubmitError()}
      document.getElementById('error-phoneNumber').classList.add('hidden');
    });
  }
`

export const resetOtpError = () => html`
  var otpEl = document.getElementById('form-otp')
  if (otpEl) {
    otpEl.addEventListener('input', function () {
      ${resetSubmitError()}
      document.getElementById('error-otp').classList.add('hidden');
    });
  }
`

export const resetEmailError = () => html`
  var emailEl = document.getElementById('form-email')
  if (emailEl) {
    emailEl.addEventListener('input', function () {
      ${resetSubmitError()}
      document.getElementById('error-email').classList.add('hidden');
    });
  }
`

export const resetPasswordError = () => html`
  var passwordEl = document.getElementById('form-password')
  if (passwordEl) {
    passwordEl.addEventListener('input', function () {
      ${resetSubmitError()}
      document.getElementById('error-password').classList.add('hidden');
    });
  }
`

export const resetConfirmPasswordError = () => html`
  var confirmPasswordEl = document.getElementById('form-confirmPassword')
  if (confirmPasswordEl) {
    confirmPasswordEl.addEventListener('input', function () {
      ${resetSubmitError()}
      document.getElementById('error-confirmPassword').classList.add('hidden');
    });
  }
`

export const resetFirstNameError = () => html`
  var firstNameEl = document.getElementById('form-firstName')
  if (firstNameEl) {
    firstNameEl.addEventListener('input', function () {
      ${resetSubmitError()}
      document.getElementById('error-firstName').classList.add('hidden');
    });
  }
`

export const resetLastNameError = () => html`
  var lastNameEl = document.getElementById('form-lastName')
  if (lastNameEl) {
    lastNameEl.addEventListener('input', function () {
      ${resetSubmitError()}
      document.getElementById('error-lastName').classList.add('hidden');
    });
  }
`

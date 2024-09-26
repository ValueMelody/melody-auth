import { html } from 'hono/html'
import {
  localeConfig, typeConfig,
} from 'configs'

export const verificationCode = (locale: typeConfig.Locale) => html`
  var msg;
  var codeVal = document.getElementById('form-code').value.trim();
  if (codeVal.length !== 8) msg = "${localeConfig.validateError.verificationCodeLengthIssue[locale]}";
  if (msg) {
    var errorEl = document.getElementById('error-code');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const verificationOtp = (locale: typeConfig.Locale) => html`
  var msg;
  var otpVal = document.getElementById('form-otp').value.trim();
  if (otpVal.length !== 6) msg = "${localeConfig.validateError.otpCodeLengthIssue[locale]}";
  if (msg) {
    var errorEl = document.getElementById('error-otp');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const email = (locale: typeConfig.Locale) => html`
  var msg;
  var emailVal = document.getElementById('form-email').value.trim();
  if (!emailVal) msg = "${localeConfig.validateError.emailIsRequired[locale]}";
  if (msg) {
    var errorEl = document.getElementById('error-email');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const phoneNumber = (locale: typeConfig.Locale) => html`
var msg;
var phoneVal = document.getElementById('form-phoneNumber').value.trim();
if (!phoneVal) msg = "${localeConfig.validateError.phoneNumberIsRequired[locale]}";
var regex = /^\\\+[1-9]\\\d{1,14}$/;
const isValid = regex.test(phoneVal);
if (!isValid) msg = "${localeConfig.validateError.wrongPhoneFormat[locale]}";
if (msg) {
  var errorEl = document.getElementById('error-phoneNumber');
  errorEl.classList.remove('hidden');
  errorEl.innerHTML = msg;
  return false;
}
`

export const firstName = (locale: typeConfig.Locale) => html`
  var msg;
  var firstNameVal = document.getElementById('form-firstName').value.trim();
  if (!firstNameVal) msg = "${localeConfig.validateError.firstNameIsEmpty[locale]}";
  if (msg) {
    var errorEl = document.getElementById('error-firstName');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const lastName = (locale: typeConfig.Locale) => html`
  var msg;
  var lastNameVal = document.getElementById('form-lastName').value.trim();
  if (!lastNameVal) msg = "${localeConfig.validateError.lastNameIsEmpty[locale]}";
  if (msg) {
    var errorEl = document.getElementById('error-lastName');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const password = (locale: typeConfig.Locale) => html`
  var msg;
  var passwordVal = document.getElementById('form-password').value;
  if (!passwordVal) msg = "${localeConfig.validateError.passwordIsRequired[locale]}";
  if (msg) {
    var errorEl = document.getElementById('error-password');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

export const confirmPassword = (locale: typeConfig.Locale) => html`
  var msg;
  var passwordVal = document.getElementById('form-password').value;
  var confirmPasswordVal = document.getElementById('form-confirmPassword').value;
  if (passwordVal !== confirmPasswordVal) msg = "${localeConfig.validateError.passwordNotMatch[locale]}";
  if (msg) {
    var errorEl = document.getElementById('error-confirmPassword');
    errorEl.classList.remove('hidden');
    errorEl.innerHTML = msg;
    return false;
  }
`

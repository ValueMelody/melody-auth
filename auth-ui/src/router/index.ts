import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { View } from '@/api/types'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/authorize',
  },
  {
    path: '/authorize',
    name: View.SignIn,
    component: () => import('@/views/SignIn.vue'),
  },
  {
    path: '/sign-up',
    name: View.SignUp,
    component: () => import('@/views/SignUp.vue'),
  },
  {
    path: '/consent',
    name: View.Consent,
    component: () => import('@/views/Consent.vue'),
  },
  {
    path: '/passwordless-verify',
    name: View.PasswordlessVerify,
    component: () => import('@/views/PasswordlessVerify.vue'),
  },
  {
    path: '/recovery-code-sign-in',
    name: View.RecoveryCodeSignIn,
    component: () => import('@/views/RecoveryCodeSignIn.vue'),
  },
  {
    path: '/mfa-enroll',
    name: View.MfaEnroll,
    component: () => import('@/views/MfaEnroll.vue'),
  },
  {
    path: '/otp-setup',
    name: View.OtpSetup,
    component: () => import('@/views/OtpSetup.vue'),
  },
  {
    path: '/otp-mfa',
    name: View.OtpMfa,
    component: () => import('@/views/OtpMfa.vue'),
  },
  {
    path: '/email-mfa',
    name: View.EmailMfa,
    component: () => import('@/views/EmailMfa.vue'),
  },
  {
    path: '/sms-mfa',
    name: View.SmsMfa,
    component: () => import('@/views/SmsMfa.vue'),
  },
  {
    path: '/passkey-enroll',
    name: View.PasskeyEnroll,
    component: () => import('@/views/PasskeyEnroll.vue'),
  },
  {
    path: '/manage-passkey',
    name: View.ManagePasskey,
    component: () => import('@/views/ManagePasskey.vue'),
  },
  {
    path: '/recovery-code-enroll',
    name: View.RecoveryCodeEnroll,
    component: () => import('@/views/RecoveryCodeEnroll.vue'),
  },
  {
    path: '/manage-recovery-code',
    name: View.ManageRecoveryCode,
    component: () => import('@/views/ManageRecoveryCode.vue'),
  },
  {
    path: '/update-info',
    name: View.UpdateInfo,
    component: () => import('@/views/UpdateInfo.vue'),
  },
  {
    path: '/change-password',
    name: View.ChangePassword,
    component: () => import('@/views/ChangePassword.vue'),
  },
  {
    path: '/change-email',
    name: View.ChangeEmail,
    component: () => import('@/views/ChangeEmail.vue'),
  },
  {
    path: '/reset-password',
    name: View.ResetPassword,
    component: () => import('@/views/ResetPassword.vue'),
  },
  {
    path: '/reset-mfa',
    name: View.ResetMfa,
    component: () => import('@/views/ResetMfa.vue'),
  },
  {
    path: '/verify-email',
    name: View.VerifyEmail,
    component: () => import('@/views/VerifyEmail.vue'),
  },
  {
    path: '/switch-org',
    name: View.SwitchOrg,
    component: () => import('@/views/SwitchOrg.vue'),
  },
  {
    path: '/change-org',
    name: View.ChangeOrg,
    component: () => import('@/views/ChangeOrg.vue'),
  },
  {
    path: '/auth-code-expired',
    name: View.AuthCodeExpired,
    component: () => import('@/views/AuthCodeExpired.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { useSignInForm } from '@/composables/useSignInForm'
import { usePasskey } from '@/composables/usePasskey'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import EmailField from '@/components/ui/EmailField.vue'
import PasswordField from '@/components/ui/PasswordField.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import Banner from '@/components/ui/Banner.vue'
import GoogleSignIn from '@/components/social/GoogleSignIn.vue'
import FacebookSignIn from '@/components/social/FacebookSignIn.vue'
import GithubSignIn from '@/components/social/GithubSignIn.vue'
import DiscordSignIn from '@/components/social/DiscordSignIn.vue'
import AppleSignIn from '@/components/social/AppleSignIn.vue'
import OidcSignIn from '@/components/social/OidcSignIn.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const {
  email,
  password,
  errors,
  isSubmitting,
  isPasswordlessSigningIn,
  handleSubmit,
  handlePasswordlessSignIn,
} = useSignInForm(onSwitchView)

const {
  passkeyOption,
  isVerifying,
  getPasskeyOption,
  verifyPasskey,
  resetPasskeyInfo,
} = usePasskey(onSwitchView)

const initialProps = computed(() => authStore.initialProps)
const appBanners = computed(() => authStore.appBanners)
const submitError = computed(() => authStore.submitError)

const shouldLoadPasskeyInfo = computed(() => {
  if (!initialProps.value?.enablePasswordSignIn && !initialProps.value?.enablePasswordlessSignIn) {
    return false
  }
  return passkeyOption.value === null && email.value.includes('@')
})

const hasSocialLogin = computed(() => {
  if (!initialProps.value) return false
  return !!(
    initialProps.value.googleClientId ||
    initialProps.value.facebookClientId ||
    initialProps.value.githubClientId ||
    initialProps.value.discordClientId ||
    initialProps.value.appleClientId ||
    (initialProps.value.oidcProviders && initialProps.value.oidcProviders.length > 0)
  )
})

const showPasswordField = computed(() => {
  return initialProps.value?.enablePasswordSignIn && !shouldLoadPasskeyInfo.value
})

const handleContinue = () => {
  getPasskeyOption(email.value)
}

const handleUnlockEmail = () => {
  resetPasskeyInfo()
}

const getBannerText = (banner: { locales: { locale: string; value: string }[]; text: string }) => {
  const localized = banner.locales.find((l) => l.locale === locale.value)
  return localized?.value || banner.text
}

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('signIn.title')" />

    <Banner
      v-for="banner in appBanners"
      :key="banner.id"
      :type="banner.type"
      :text="getBannerText(banner)"
    />

    <form autocomplete="on" class="w-full" @submit="handleSubmit">
      <section class="flex flex-col gap-2">
        <EmailField
          v-if="initialProps?.enablePasswordSignIn || initialProps?.enablePasswordlessSignIn"
          v-model="email"
          :label="t('signIn.email')"
          name="email"
          required
          auto-complete="email"
          :error="errors.email"
          :locked="passkeyOption !== null"
          @unlock="handleUnlockEmail"
        />

        <PrimaryButton
          v-if="passkeyOption"
          type="button"
          class="mt-2 mb-4"
          :title="t('signIn.withPasskey')"
          :is-loading="isVerifying"
          @click="verifyPasskey"
        />

        <PasswordField
          v-if="showPasswordField"
          v-model="password"
          :label="t('signIn.password')"
          name="password"
          required
          auto-complete="current-password"
          :error="errors.password"
        />

        <SubmitError :error="submitError" />

        <PrimaryButton
          v-if="shouldLoadPasskeyInfo"
          type="button"
          class="mt-4"
          :title="t('signIn.continue')"
          @click="handleContinue"
        />

        <PrimaryButton
          v-if="initialProps?.enablePasswordSignIn && !shouldLoadPasskeyInfo"
          type="submit"
          class="mt-4"
          :title="t('signIn.submit')"
          :is-loading="isSubmitting"
        />

        <PrimaryButton
          v-if="initialProps?.enablePasswordlessSignIn && !shouldLoadPasskeyInfo"
          type="button"
          class="mt-4"
          :title="t('signIn.continue')"
          :is-loading="isPasswordlessSigningIn"
          @click="handlePasswordlessSignIn"
        />
      </section>

      <section v-if="hasSocialLogin" class="flex flex-col gap-4 mt-4 items-center">
        <GoogleSignIn
          v-if="initialProps?.googleClientId"
          :google-client-id="initialProps.googleClientId"
        />
        <FacebookSignIn
          v-if="initialProps?.facebookClientId"
          :facebook-client-id="initialProps.facebookClientId"
        />
        <GithubSignIn v-if="initialProps?.githubClientId" />
        <DiscordSignIn v-if="initialProps?.discordClientId" />
        <AppleSignIn v-if="initialProps?.appleClientId" />
        <OidcSignIn
          v-if="initialProps?.oidcProviders && initialProps.oidcProviders.length > 0"
          :providers="initialProps.oidcProviders"
        />
      </section>
    </form>

    <section
      v-if="initialProps?.enableSignUp || initialProps?.allowRecoveryCode || initialProps?.enablePasswordReset"
      class="flex flex-col gap-2 w-full"
    >
      <SecondaryButton
        v-if="initialProps?.enableSignUp"
        :title="t('signIn.signUp')"
        @click="onSwitchView(View.SignUp)"
      />
      <SecondaryButton
        v-if="initialProps?.allowRecoveryCode"
        :title="t('signIn.recoveryCode')"
        @click="onSwitchView(View.RecoveryCodeSignIn)"
      />
      <SecondaryButton
        v-if="initialProps?.enablePasswordReset"
        :title="t('signIn.passwordReset')"
        @click="onSwitchView(View.ResetPassword)"
      />
    </section>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { useSignUpForm } from '@/composables/useSignUpForm'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import EmailField from '@/components/ui/EmailField.vue'
import PasswordField from '@/components/ui/PasswordField.vue'
import FieldInput from '@/components/ui/FieldInput.vue'
import FieldLabel from '@/components/ui/FieldLabel.vue'
import FieldError from '@/components/ui/FieldError.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'

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
  confirmPassword,
  firstName,
  lastName,
  customAttributes,
  userAttributes,
  errors,
  isSubmitting,
  handleSubmit,
  setTouched,
} = useSignUpForm(onSwitchView)

const submitError = computed(() => authStore.submitError)
const initialProps = computed(() => authStore.initialProps)

const getAttributeLabel = (attr: { name: string; locales: { locale: string; value: string }[] }) => {
  const localized = attr.locales.find((l) => l.locale === locale.value)
  return localized?.value || attr.name
}

const handleAttributeChange = (attrName: string, value: string) => {
  customAttributes.value = { ...customAttributes.value, [attrName]: value }
  setTouched(attrName)
}

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('signUp.title')" />

    <form autocomplete="on" class="w-full" @submit="handleSubmit">
      <section class="flex flex-col gap-2">
        <EmailField
          v-model="email"
          :label="t('signUp.email')"
          name="email"
          required
          auto-complete="email"
          :error="errors.email"
        />

        <PasswordField
          v-model="password"
          :label="t('signUp.password')"
          name="password"
          required
          auto-complete="new-password"
          :error="errors.password"
        />

        <PasswordField
          v-model="confirmPassword"
          :label="t('signUp.confirmPassword')"
          name="confirmPassword"
          required
          auto-complete="new-password"
          :error="errors.confirmPassword"
        />

        <template v-if="initialProps?.enableNames">
          <section class="flex flex-col gap-2">
            <FieldLabel :label="t('signUp.firstName')" field-name="firstName" />
            <FieldInput
              v-model="firstName"
              type="text"
              name="firstName"
              auto-complete="given-name"
            />
            <FieldError :error="errors.firstName" />
          </section>

          <section class="flex flex-col gap-2">
            <FieldLabel :label="t('signUp.lastName')" field-name="lastName" />
            <FieldInput
              v-model="lastName"
              type="text"
              name="lastName"
              auto-complete="family-name"
            />
            <FieldError :error="errors.lastName" />
          </section>
        </template>

        <template v-for="attr in userAttributes" :key="attr.name">
          <section class="flex flex-col gap-2">
            <FieldLabel
              :label="getAttributeLabel(attr)"
              :field-name="attr.name"
              :required="attr.requiredInSignUp"
            />
            <FieldInput
              :model-value="customAttributes[attr.name] || ''"
              type="text"
              :name="attr.name"
              @update:model-value="(val) => handleAttributeChange(attr.name, val)"
            />
            <FieldError :error="errors[attr.name]" />
          </section>
        </template>

        <SubmitError :error="submitError" />

        <PrimaryButton
          type="submit"
          class="mt-4"
          :title="t('signUp.signUp')"
          :is-loading="isSubmitting"
        />
      </section>
    </form>

    <section v-if="initialProps?.termsLink || initialProps?.privacyPolicyLink" class="text-sm text-center">
      <span>{{ t('signUp.bySignUp') }} </span>
      <a v-if="initialProps?.termsLink" :href="initialProps.termsLink" target="_blank" class="underline">
        {{ t('signUp.terms') }}
      </a>
      <span v-if="initialProps?.termsLink && initialProps?.privacyPolicyLink"> {{ t('signUp.linkConnect') }} </span>
      <a v-if="initialProps?.privacyPolicyLink" :href="initialProps.privacyPolicyLink" target="_blank" class="underline">
        {{ t('signUp.privacyPolicy') }}
      </a>
    </section>

    <SecondaryButton
      :title="t('signUp.signIn')"
      @click="onSwitchView(View.SignIn)"
    />
  </AuthLayout>
</template>

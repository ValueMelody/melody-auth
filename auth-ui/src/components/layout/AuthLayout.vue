<script setup lang="ts">
import { useBrandingStore } from '@/stores/branding'
import { useLocaleStore } from '@/stores/locale'
import { useI18n } from 'vue-i18n'
import LocaleSelector from './LocaleSelector.vue'

const brandingStore = useBrandingStore()
const localeStore = useLocaleStore()
const { t } = useI18n()

const showLocaleSelector = localeStore.supportedLocales.length > 1
</script>

<template>
  <main class="flex flex-col items-center justify-center w-full min-h-screen bg-[var(--color-layoutColor)] text-[var(--color-labelColor)]">
    <section class="flex flex-col justify-center items-center bg-white box-shadow rounded-lg">
      <section class="flex flex-col items-center gap-4 max-h-[80vh] p-8 overflow-y-auto overflow-x-hidden">
        <!-- Header with Logo and Locale Selector -->
        <header class="relative flex w-full justify-center items-center">
          <img
            v-if="brandingStore.config.logoUrl"
            class="w-10"
            :src="brandingStore.config.logoUrl"
            alt="Logo"
          />
          <div v-if="showLocaleSelector" class="absolute right-0">
            <LocaleSelector />
          </div>
        </header>

        <!-- Content -->
        <section class="flex flex-col justify-center items-center gap-4 w-[var(--text-width)]">
          <slot />
        </section>

        <!-- Footer -->
        <a
          target="_blank"
          href="https://github.com/ValueMelody/melody-auth"
          class="text-sm mt-2"
        >
          {{ t('layout.poweredByAuth') }}
        </a>
      </section>
    </section>
  </main>
</template>

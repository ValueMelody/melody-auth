<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

defineProps<{
  page: string
  parent?: { label: string; href: string }
}>()

const { t } = useI18n()
</script>

<template>
  <BreadcrumbRoot class="mb-4">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/dashboard">
          {{ t('layout.dashboard') }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <template v-if="parent">
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink :href="parent.href">
            {{ parent.label }}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </template>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{{ page }}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </BreadcrumbRoot>
</template>

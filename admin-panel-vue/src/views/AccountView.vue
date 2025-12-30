<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
const apiUrl = import.meta.env.VITE_API_URL || ''

const accountLinks = [
  { key: 'updateInfo', path: '/identity/update-info' },
  { key: 'changePassword', path: '/identity/change-password' },
  { key: 'changeEmail', path: '/identity/change-email' },
  { key: 'resetMfa', path: '/identity/reset-mfa' },
  { key: 'managePasskey', path: '/identity/manage-passkey' },
  { key: 'manageRecoveryCode', path: '/identity/manage-recovery-code' }
]
</script>

<template>
  <div>
    <PageTitle :title="t('layout.account')" />
    <Card>
      <CardHeader>
        <CardTitle>{{ t('layout.account') }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <Button 
          v-for="link in accountLinks" 
          :key="link.key"
          variant="outline" 
          class="w-full justify-start"
          as="a"
          :href="apiUrl + link.path"
        >
          {{ t('account.' + link.key) }}
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

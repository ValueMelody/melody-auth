<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'

const { t } = useI18n()
</script>

<template>
  <div>
    <PageTitle :title="t('apps.appBanners')" />
    <Card>
      <CardContent class="p-6">
        <p class="text-muted-foreground">{{ t('apps.appBanners') }} - View implementation pending</p>
      </CardContent>
    </Card>
  </div>
</template>

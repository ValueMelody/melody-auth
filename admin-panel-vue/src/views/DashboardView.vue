<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const { t } = useI18n()
</script>

<template>
  <div>
    <PageTitle :title="t('layout.dashboard')" />
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>{{ t('dashboard.informationConfigs') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">System configuration overview</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{{ t('dashboard.links') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2 text-sm">
            <li><a href="/api/swagger" target="_blank" class="text-primary hover:underline">{{ t('dashboard.apiSwagger') }}</a></li>
            <li><a href="/api/embedded-swagger" target="_blank" class="text-primary hover:underline">{{ t('dashboard.embeddedSwagger') }}</a></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

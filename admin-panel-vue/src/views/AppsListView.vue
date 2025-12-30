<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { CreateButton, EntityStatusLabel, ClientTypeLabel, LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { useApps } from '@/api/endpoints/apps'
import { Pencil } from 'lucide-vue-next'

const { t } = useI18n()
const { data, isLoading } = useApps()

const apps = computed(() => data.value ?? [])
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageTitle :title="t('apps.title')" class="mb-0" />
      <CreateButton to="/apps/new" :label="'apps.new'" />
    </div>

    <LoadingPage v-if="isLoading" />

    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>{{ t('apps.name') }}</TableHead>
          <TableHead>{{ t('apps.clientId') }}</TableHead>
          <TableHead>{{ t('apps.type') }}</TableHead>
          <TableHead>{{ t('apps.status') }}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="app in apps" :key="app.id">
          <TableCell>{{ app.name }}</TableCell>
          <TableCell class="font-mono text-sm">{{ app.clientId }}</TableCell>
          <TableCell>
            <ClientTypeLabel :type="app.type" />
          </TableCell>
          <TableCell>
            <EntityStatusLabel :is-active="app.isActive" />
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="icon" as-child>
              <router-link :to="'/apps/' + app.id">
                <Pencil class="size-4" />
              </router-link>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
